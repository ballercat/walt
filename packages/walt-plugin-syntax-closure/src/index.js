/**
 * Closure plugin.
 *
 * Here be dragons
 *
 */
import Syntax from 'walt-syntax';
import {
  parser,
  expressionFragment as expression,
  statementFragment as statement,
} from 'walt-compiler';
import { enter, find, current } from 'walt-parser-tools/scope';
import hasNode from 'walt-parser-tools/has-node';
import walkNode from 'walt-parser-tools/walk-node';

import { dependency, DEPENDENCY_NAME } from './dependency';

const sizes = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4,
};

const sum = (a, b) => a + b;
const LOCAL_INDEX = 'local/index';

export { DEPENDENCY_NAME, dependency };

export function plugin() {
  const semantics = () => {
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
        return null;
      }

      const [lhs] = parsed.params;
      const ref = environment[parsed.value];
      const call = expression(
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

    const closureImportsHeader = parser(`
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
      type ClosureGetf64 = (i32) => f64;
      type ClosureSeti32 = (i32, i32) => void;
      type ClosureSetf32 = (i32, f32) => void;
      type ClosureSeti64 = (i32, i64) => void;
      type ClosureSetf64 = (i32, f64) => void;
      // End Closure Imports Header
    `).params;

    return {
      Program: next => args => {
        const [program, context] = args;

        if (!hasNode(Syntax.Closure, program)) {
          return next(args);
        }

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
                params: [expression('(__env_ptr : i32)'), ...fnArgs.params],
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
          expression(`(${real.value} | ((__env_ptr : i64) << 32)))`),
          context,
        ]);
      },
      FunctionDeclaration: next => (args, transform) => {
        const [node, context] = args;
        const { globals } = context;
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
        const injectedEnv = statement('const __env_ptr : i32 = 0;');
        const [fnArgs, result, ...rest] = node.params;

        const closureContext = {
          ...context,
          environment,
          envSize,
          isParsingClosure: node.value,
        };
        const fun = next([
          { ...node, params: [fnArgs, result, injectedEnv, ...rest] },
          closureContext,
        ]);

        fun.params = fun.params.map(p => {
          if (p.Type === Syntax.Declaration && p.value === '__env_ptr') {
            const size = Object.values(envSize).reduce(sum, 0);
            return transform([
              statement(`const __env_ptr : i32 = __closure_malloc(${size});`),
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
        if (types[node.value] && types[node.value].meta.CLOSURE_TYPE) {
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

        const call = expression(`__closure_set_${type}(__env_ptr + ${offset})`);
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
          expression(`__closure_get_${type}(__env_ptr + ${offset})`),
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
            expression(`((${local.value} >> 32) : i32)`),
            ...call.params,
            expression(`(${local.value} : i32)`),
          ].map(p => transform([p, context]));

          const typedef = types[local.meta.ALIAS];
          const typeIndex = Object.keys(types).indexOf(typedef.value);

          return {
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
        }

        return next(args);
      },
    };
  };

  return {
    semantics,
  };
}
