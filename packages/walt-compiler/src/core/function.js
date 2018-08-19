/* Core function plugin
 *
 * This plugin only handles the basics of functions like vanilla funciton calls,
 * arguments and return statements
 */
import Syntax from '../Syntax';
import { current, enter, exit } from 'walt-parser-tools/scope';
import {
  FUNCTION_INDEX,
  FUNCTION_METADATA,
  LOCAL_INDEX,
} from '../semantics/metadata';
import { typeWeight } from '../types';

export default function coreFunctionPlugin() {
  return {
    semantics() {
      return {
        FunctionDeclaration: _ignore => ([fun, context], transform) => {
          context = {
            ...context,
            result: fun.result,
            locals: {},
            arguments: [],
            scopes: enter(context.scopes, LOCAL_INDEX),
          };

          // first two parameters to a function node are the arguments and result
          const [argsNode, resultNode, ...rest] = fun.params;
          const [args, result] = [argsNode, resultNode].map(p =>
            transform([p, context])
          );

          const ref = {
            ...fun,
            // This is set by the parsers below if necessary
            type: context.result,
            meta: {
              ...fun.meta,
              [FUNCTION_INDEX]: Object.keys(context.functions).length,
              [FUNCTION_METADATA]: {
                argumentsCount: context.arguments.length,
                locals: current(context.scopes),
              },
            },
          };
          context.functions[fun.value] = ref;

          // Parse the statements last, so that they can self-reference the function
          const statements = rest.map(p => transform([p, context]));

          ref.params = [args, result, ...statements];

          context.scopes = exit(context.scopes);

          return ref;
        },
        FunctionResult: _ignore => ([result, context]) => {
          // Function statements are sybligs of FuncionResult so we need to mutate
          // the parent context (FunctionDeclaration)
          context.result = result.type;
          return result;
        },
        FunctionArguments: next => ([args, context]) => {
          return next([
            { ...args, params: args.params.filter(Boolean) },
            { ...context, isParsingArguments: true },
          ]);
        },
        Pair: next => (args, transform) => {
          const [node, context] = args;
          if (context.isParsingArguments) {
            const [identifier, typeNode] = node.params;

            context.arguments.push(node);

            transform([
              {
                ...node,
                value: identifier.value,
                type: typeNode.value,
                params: [],
                Type: Syntax.Declaration,
              },
              context,
            ]);

            return node;
          }

          return next(args);
        },
        // Regular function calls
        FunctionCall: next => ([call, context]) => {
          const { functions } = context;
          const index = Object.keys(functions).indexOf(call.value);

          return next([
            {
              ...call,
              type:
                functions[call.value] != null
                  ? functions[call.value].type
                  : null,
              meta: { [FUNCTION_INDEX]: index },
            },
            context,
          ]);
        },
        ReturnStatement: _ignore => ([returnNode, context], transform) => {
          const [expression] = returnNode.params.map(p =>
            transform([p, context])
          );
          const { result } = context;
          // Consants as return values need to be assigned a correct type
          // (matching the result expected)
          if (
            expression != null &&
            expression.Type === Syntax.Constant &&
            typeWeight(expression.type) !== typeWeight(result)
          ) {
            return {
              ...returnNode,
              type: result,
              params: [{ ...expression, type: result }],
            };
          }

          const type = expression ? expression.type : null;
          return {
            ...returnNode,
            params: [expression],
            type,
          };
        },
      };
    },
  };
}
