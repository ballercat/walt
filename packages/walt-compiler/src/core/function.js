/* Core function plugin
 *
 * @flow
 *
 * This plugin only handles the basics of functions like vanilla function calls,
 * arguments and return statements
 */
import Syntax from 'walt-syntax';
import { current, enter, exit, signature } from 'walt-parser-tools/scope';
import walkNode from 'walt-parser-tools/walk-node';
import {
  FUNCTION_INDEX,
  FUNCTION_METADATA,
  LOCAL_INDEX,
} from '../semantics/metadata';
import { typeWeight } from '../types';
import type {
  SemanticPlugin,
  FunctionDeclaration,
  FunctionArguments,
  Context,
} from '../flow/types';

export default function coreFunctionPlugin(): SemanticPlugin {
  return {
    semantics() {
      return {
        [Syntax.FunctionDeclaration]: _ignore => (
          [fun, context]: [FunctionDeclaration, Context],
          transform
        ) => {
          // Enter a new scope, where all new declaration will go into
          context.scopes = enter(context.scopes, LOCAL_INDEX);
          const currentScope = current(context.scopes);

          const [argsNode, resultNode, block] = fun.params;
          const [args, result] = [argsNode, resultNode].map(p =>
            transform([p, context])
          );

          const ref = {
            ...fun,
            // This is set by the parsers below if necessary, defaults to null
            type: currentScope[signature].result,
            meta: {
              ...fun.meta,
              [FUNCTION_INDEX]: Object.keys(context.functions).length,
              [FUNCTION_METADATA]: {
                argumentsCount: currentScope[signature].arguments.length,
                locals: current(context.scopes),
              },
            },
          };
          context.functions[fun.value] = ref;

          // Parse the block last, so that they can self-reference the function
          ref.params = [args, result, transform([block, context])];

          context.scopes = exit(context.scopes);

          return ref;
        },
        [Syntax.FunctionResult]: _next => ([result, context]) => {
          // Function statements are sybligs of FunctionResult so we need to mutate
          // the parent context (FunctionDeclaration)
          const currentScope = current(context.scopes);
          currentScope[signature].result = result.type;

          return result;
        },
        [Syntax.FunctionArguments]: _next => (
          [args, context]: [FunctionArguments, Context],
          transform
        ) => {
          const currentScope = current(context.scopes);

          currentScope[signature].arguments = [];

          walkNode({
            [Syntax.Pair]: node => {
              const [identifier, typeNode] = node.params;

              currentScope[signature].arguments.push(node);

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
            },
          })({ ...args, params: args.params.filter(Boolean) });

          return args;
        },
        // Regular function calls
        [Syntax.FunctionCall]: next => ([call, context]) => {
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
              params: call.params.slice(1),
            },
            context,
          ]);
        },
        [Syntax.ReturnStatement]: _next => (
          [returnNode, context],
          transform
        ) => {
          const currentScope = current(context.scopes);

          const [expression] = returnNode.params.map(p =>
            transform([p, context])
          );
          const { result } = currentScope[signature];
          // Constants as return values need to be assigned a correct type
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
