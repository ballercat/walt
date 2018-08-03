/* Core function plugin
 *
 * This plugin only handles the basics of functions like vanilla funciton calls,
 * arguments and return statements
 */
import Syntax from '../Syntax';
import { FUNCTION_INDEX, FUNCTION_METADATA } from '../semantics/metadata';
import { typeWeight } from '../types';

export default function coreFunctionPlugin() {
  return {
    semantics(_options) {
      return {
        FunctionDeclaration: next => ([fun, context]) => {
          context = {
            ...context,
            result: fun.result,
            locals: {},
            arguments: [],
          };
          // TODO: setup correct order of parsing statements: declarations first,
          // statements last
          const result = next([fun, context]);

          const parsed = {
            ...result,
            meta: {
              [FUNCTION_INDEX]: Object.keys(context.functions).length,
              [FUNCTION_METADATA]: {
                locals: context.locals,
                argumentsCount: context.arguments.length,
              },
            },
            type: context.result,
          };

          context.functions[fun.value] = parsed;

          return parsed;
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
