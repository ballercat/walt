/**
 * Closure plugin.
 *
 */
import Syntax from 'walt-syntax';
import { enter, find, current } from 'walt-parser-tools/scope';
import hasNode from 'walt-parser-tools/has-node';
import walkNode from 'walt-parser-tools/walk-node';
import grammar from './closures.ne';
import source from './closures.walt';
export const DEPENDENCY_NAME = 'walt-plugin-closure';

const sizes = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4,
};

const sum = (a, b) => a + b;
const LOCAL_INDEX = 'local/index';

const importsSource = `
// Start Closure Imports Header
import {
  __closure_malloc: ClosureGeti32,
  __closure_free: ClosureFree,
  __closure_get_i32: ClosureGeti32,
  __closure_get_f32: ClosureGetf32,
  __closure_get_i64: ClosureGeti64,
  __closure_get_f64: ClosureGetf64,
  __closure_set_i32: ClosureSeti32,
  __closure_set_f32: ClosureSetf32,
  __closure_set_i64: ClosureSeti64,
  __closure_set_f64: ClosureSetf64
} from '${DEPENDENCY_NAME}';
type ClosureFree = (i32) => void;
type ClosureGeti32 = (i32) => i32;
type ClosureGetf32 = (i32) => f32;
type ClosureGeti64 = (i32) => i64;
type ClosureGetf64 = (i32) => f64; type ClosureSeti32 = (i32, i32) => void;
type ClosureSetf32 = (i32, f32) => void;
type ClosureSeti64 = (i32, i64) => void;
type ClosureSetf64 = (i32, f64) => void;
// End Closure Imports Header
`;

// Imports for the users of the plugin
export function imports(options, compile) {
  return WebAssembly.instantiate(compile(source, options).buffer()).then(
    mod => ({
      [DEPENDENCY_NAME]: mod.instance.exports,
    })
  );
}

export function plugin() {
  const semantics = ({ parser, fragment }) => {
    // Declaration parser, re-used for mutable/immutable declarations
    const declarationParser = next => (args, transform) => {
      const [node, context] = args;
      const { environment, types } = context;

      // Not a closure scan and not an environment variable
      if (!context.isParsingClosure || !environment[node.value]) {
        // Check if the declaration is a lambda, as we will need to unroll this
        // into an i64
        if (types[node.type] && types[node.type].meta.CLOSURE_TYPE) {
          return next([
            {
              ...node,
              type: 'i64',
              meta: {
                ...node.meta,
                CLOSURE_INSTANCE: true,
                ALIAS: node.type,
              },
            },
            context,
          ]);
        }
        return next(args);
      }

      const parsed = next(args);
      environment[parsed.value] = {
        ...parsed,
        meta: {
          ...parsed.meta,
          ENV_OFFSET: Object.values(context.envSize).reduce(sum, 0),
        },
      };
      context.envSize[parsed.value] = sizes[parsed.type] || 4;

      // If the variable is declared but has no initializer we simply nullify the
      // node as there is nothing else to do here.
      if (!parsed.params.length) {
        return { ...parsed, Type: Syntax.Noop };
      }

      const [lhs] = parsed.params;
      const ref = environment[parsed.value];
      const call = fragment(
        `__closure_set_${ref.type}(__env_ptr + ${ref.meta.ENV_OFFSET})`
      );
      return transform([
        {
          ...call,
          params: [...call.params, lhs],
        },
        context,
      ]);
    };

    return {
      // One drawback of having a plugin for closures isntead of built in support
      // is that it's rather difficult to pre-parse the Generic Closure types.
      // Since generics depend on the real type nodes being already processed we
      // loose the benifit of using a generic type before its defined.
      GenericType: _ => semanticArgs => {
        const [node, context] = semanticArgs;
        const { types } = context;
        const [generic] = node.params;
        const [T] = generic.params;
        const realType = types[T.value];
        const [args, result] = realType.params;
        // Patch the node to be a real type which we can reference later
        const patch = {
          ...realType,
          range: generic.range,
          value: node.value,
          meta: {
            ...realType.meta,
            CLOSURE_TYPE: generic.value === 'Lambda',
          },
          params: [
            {
              ...args,
              params: [
                {
                  ...args,
                  params: [],
                  type: 'i32',
                  value: 'i32',
                  Type: Syntax.Type,
                },
                ...args.params,
              ],
            },
            result,
          ],
        };
        types[patch.value] = patch;

        return patch;
      },
      Program: next => semanticArgs => {
        const [program, context] = semanticArgs;

        if (!hasNode(Syntax.Closure, program)) {
          return next(semanticArgs);
        }

        const closureImportsHeader = parser(importsSource).params;
        const closures = [];
        const parsedProgram = next([
          {
            ...program,
            params: [...closureImportsHeader, ...program.params],
          },
          { ...context, closures },
        ]);

        const result = {
          ...parsedProgram,
          params: [...parsedProgram.params, ...closures],
        };
        return result;
      },
      Closure: _next => (args, transform) => {
        const [closure, context] = args;

        // NOTE: All variables should really be kept in a single "scope" object

        const [declaration] = closure.params;
        const [fnArgs, result, ...rest] = declaration.params;
        // Create the real function node to be compiled which was originally a
        // closure EXPRESSION inside it's parent function. Once this run we will
        // have a function table reference which we will reference in the output
        // of this method.
        const real = transform([
          {
            ...declaration,
            value: `__closure_${context.isParsingClosure}_0`,
            // Each closure now needs to have a pointer to it's environment. We inject
            // that that at the front of the arguments list as an i32 local.
            //
            // Let the rest of the function parser continue as normal
            params: [
              {
                ...fnArgs,
                // Parens are necessary around a fragment as it has to be a complete
                // expression, a ; would also likely work and be discarded but that would
                // be even odder in the context of function arguments
                params: [fragment('(__env_ptr : i32)'), ...fnArgs.params],
              },
              result,
              ...rest,
            ],
          },
          context,
        ]);

        // Before we complete our work here, we have to attach the 'real' function
        // created above to the output of the program so that it can become part
        // of the final WASM output.
        context.closures.push(real);

        return transform([
          fragment(`(${real.value} | ((__env_ptr : i64) << 32))`),
          context,
        ]);
      },
      FunctionDeclaration: next => (args, transform) => {
        const [node, context] = args;
        const globals = context.scopes[0];
        if (context.isParsingClosure || !hasNode(Syntax.Closure, node)) {
          return next(args);
        }

        const environment = {};
        const envSize = {};
        walkNode({
          Closure(closure, _) {
            // All closures have their own __env_ptr passed in at call site
            const declarations = { __env_ptr: true };
            walkNode({
              // We need to make sure we ignore the arguments to the closure.
              // Otherwise they will be treaded as "closed over" variables
              FunctionArguments(closureArgs, _ignore) {
                walkNode({
                  Pair(pair) {
                    const [identifier] = pair.params;
                    declarations[identifier.value] = identifier;
                  },
                })(closureArgs);
              },
              Declaration(decl, __) {
                declarations[decl.value] = decl;
              },
              Identifier(id) {
                if (!declarations[id.value] && !globals[id.value]) {
                  environment[id.value] = id;
                }
              },
            })(closure);
          },
        })(node);

        // We will initialize with an empty env for now and patch this once we
        // know the sizes of all environment variables
        const injectedEnv = fragment('const __env_ptr : i32 = 0');
        const [fnArgs, result, block] = node.params;

        const closureContext = {
          ...context,
          environment,
          envSize,
          isParsingClosure: node.value,
        };
        const fun = next([
          {
            ...node,
            params: [
              fnArgs,
              result,
              { ...block, params: [injectedEnv, ...block.params] },
            ],
          },
          closureContext,
        ]);

        fun.params = fun.params.map(p => {
          if (p.Type === Syntax.Declaration && p.value === '__env_ptr') {
            const size = Object.values(envSize).reduce(sum, 0);
            return transform([
              fragment(`const __env_ptr : i32 = __closure_malloc(${size})`),
              { ...context, scopes: enter(context.scopes, LOCAL_INDEX) },
            ]);
          }

          return p;
        });

        return fun;
      },
      Declaration: declarationParser,
      ImmutableDeclaration: declarationParser,
      FunctionResult: next => args => {
        const [node, context] = args;
        const { types } = context;

        if (types[node.type] && types[node.type].meta.CLOSURE_TYPE) {
          return next([
            {
              ...node,
              type: 'i64',
              value: 'i64',
              meta: {
                ...node.meta,
                ALIAS: node.type,
              },
            },
            context,
          ]);
        }
        return next(args);
      },
      Assignment: next => (args, transform) => {
        const [node, context] = args;
        const { scopes, environment } = context;
        const [rhs, lhs] = node.params;

        if (!context.isParsingClosure) {
          return next(args);
        }

        // Closures are functions and have their own locals
        if (current(scopes)[rhs.value]) {
          return next(args);
        }

        const { type, meta: { ENV_OFFSET: offset } } = environment[rhs.value];

        const call = fragment(`__closure_set_${type}(__env_ptr + ${offset})`);
        return transform([
          {
            ...call,
            params: [...call.params, lhs],
          },
          context,
        ]);
      },
      Identifier: next => (args, transform) => {
        const [node, context] = args;
        const { environment } = context;

        if (!context.isParsingClosure || !environment[node.value]) {
          return next(args);
        }

        const { type, meta: { ENV_OFFSET: offset } } = environment[node.value];

        return transform([
          fragment(`__closure_get_${type}(__env_ptr + ${offset})`),
          context,
        ]);
      },
      FunctionCall: next => (args, transform) => {
        const [call, context] = args;
        const { scopes, types } = context;
        const local = find(scopes, call.value);
        if (local && local.meta.CLOSURE_INSTANCE) {
          // Unfortunately, we cannot create a statement for this within the
          // possible syntax so we need to manually structure an indirect call node

          const params = [
            fragment(`((${local.value} >> 32) : i32)`),
            ...call.params.slice(1),
            fragment(`(${local.value} : i32)`),
          ].map(p => transform([p, context]));

          const typedef = types[local.meta.ALIAS];
          const typeIndex = Object.keys(types).indexOf(typedef.value);

          const icall = {
            ...call,
            meta: {
              ...local.meta,
              ...call.meta,
              TYPE_INDEX: typeIndex,
            },
            type: typedef != null ? typedef.type : call.type,
            params,
            Type: Syntax.IndirectFunctionCall,
          };

          return icall;
        }

        return next(args);
      },
    };
  };

  return {
    grammar,
    semantics,
  };
}
