/**
 * Closure plugin.
 *
 * Here be dragons
 *
 */
import Syntax from '../Syntax';
import closureImports from '../closure-plugin/imports';
import hasNode from '../utils/has-node';
// import print from 'walt-buildtools/print';
import printNode from '../utils/print-node';
import walkNode from '../utils/walk-node';
// import mapNode from '../utils/map-node';
import {
  expressionFragment as fragment,
  statementFragment as statement,
} from '../parser/fragment';

export const CLOSURE_FREE = 'closure-free';
export const CLOSURE_MALLOC = 'closure-malloc';
export const CLOSURE_BASE = 'closure_base';
export const CLOSURE_ENV_PTR = '__env_ptr';
export const CLOSURE_GET = 'closure--get';
export const CLOSURE_SET = 'closure--set';

export default function() {
  const semantics = () => {
    const declarationParser = next => (args, transform) => {
      const [node, context] = args;
      const { locals, environment } = context;

      const parsed = next(args);

      if (!context.isParsingClosure) {
        return parsed;
      }

      if (environment[parsed.value]) {
        context.envSize[parsed.value] = 4;
      } else {
        return parsed;
      }

      if (!parsed.params.length) {
        return null;
      }

      const [expression] = parsed.params;

      const call = fragment(
        `__closure_set_${locals[node.value].type}(${CLOSURE_ENV_PTR} + 0)`
      );
      return transform([
        {
          ...call,
          params: [...call.params, expression],
        },
        context,
      ]);
    };

    return {
      Program: next => args => {
        const [program, context] = args;

        if (!hasNode(Syntax.Closure, program)) {
          return next(args);
        }

        const closures = [];
        const parsedProgram = next([
          program,
          // { ...program, params: [...closureImports(), ...program.params] },
          { ...context, closures },
        ]);

        const result = {
          ...parsedProgram,
          params: [...parsedProgram.params, ...closures],
        };

        console.log(printNode(result));

        return result;
      },
      Closure: _next => (args, transform) => {
        const [closure, context] = args;
        const { locals, globals } = context;

        if (!context.isParsingClosure) {
          return closure;
        }

        // TODO: All variables should really be kept in a single "scope" object
        const scope = {
          ...locals,
          ...globals,
        };

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
                params: [
                  fragment(`(${CLOSURE_ENV_PTR} : i32)`),
                  ...fnArgs.params,
                ],
              },
              result,
              ...rest,
            ],
          },
          { ...context, scope },
        ]);

        // Before we complete our work here, we have to attach the 'real' function
        // created above to the output of the program so that it can become part
        // of the final WASM output.
        context.closures.push(real);

        console.log(printNode(real));

        return transform([
          fragment(`(${real.value} | ((__env_ptr : i64) << 32)))`),
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
            const declarations = {};
            walkNode({
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
            return transform([
              statement(
                `const __env_ptr : i32 = ${Object.values(envSize).reduce(
                  (a, b) => a + b
                )};`
              ),
              { ...context, locals: {} },
            ]);
          }

          return p;
        });

        // console.log(printNode(fun));

        return fun;
      },
      Declaration: declarationParser,
      ImmutableDeclaration: declarationParser,
      Assignment: next => (args, transform) => {
        const [node, context] = args;
        const { scope, locals, globals } = context;
        const [rhs, lhs] = node.params;

        if (!context.isParsingClosure) {
          return next(args);
        }

        // Closures are functions and have their own locals
        if (locals[rhs.value] || globals[rhs.value]) {
          return next(args);
        }

        const call = fragment(
          `__closure_set_${scope[rhs.value].type}(${CLOSURE_ENV_PTR} + 0)`
        );
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
        const { environment, locals } = context;

        if (!context.isParsingClosure) {
          return next(args);
        }

        if (environment[node.value] == null) {
          return next(args);
        }

        return transform([
          fragment(
            `__closure_get_${locals[node.value].type}(${CLOSURE_ENV_PTR} + 0)`
          ),
          context,
        ]);
      },
    };
  };

  return {
    semantics,
  };
}
