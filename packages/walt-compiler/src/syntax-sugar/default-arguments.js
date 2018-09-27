/**
 * Default Arguments syntax sugar plugin.
 *
 * Converts FUNCTION CALLS with missing arguments to default values
 *
 * @flow
 */
import Syntax from 'walt-syntax';
// $FlowFixMe
import grammar from './default-arguments.ne';
import walkNode from 'walt-parser-tools/walk-node';
import type { SemanticPlugin, GrammarPlugin } from '../flow/types';

export default function(): SemanticPlugin & GrammarPlugin {
  return {
    grammar,
    semantics() {
      return {
        [Syntax.FunctionDeclaration]: next => args => {
          const [node, context] = args;
          const [argumentsNode] = node.params;

          const defaultArguments = [];

          walkNode({
            Assignment: defaultArg => {
              const [, value] = defaultArg.params;
              defaultArguments.push(value);
            },
          })(argumentsNode);

          // Attach any default arguments found to the function node directly,
          // proceed with the rest of the parsers
          return next([
            {
              ...node,
              meta: { ...node.meta, DEFAULT_ARGUMENTS: defaultArguments },
            },
            context,
          ]);
        },
        // There isn't a need to parse out the Assignment expressions as they are
        // not actually compiled/generated into the final binary
        // [Syntax.Assignment]: next => (args, transform) => {
        //   const [node, context] = args;
        //   // Not inside arguments
        //   const currentScope = current(context.scopes);

        //   // Arguments have not been set for scope yet and the current scope is
        //   // not global
        //   if (currentScope.arguments == null && context.scopes.length > 1) {
        //     return next(args);
        //   }

        //   // Assignment has higher precedence than ":" Pair expressions so the
        //   // children of this node will be [Pair(id:type), Constant(value)]
        //   // remove the constant return the pair.
        //   //
        //   // A helpful visual of a valid default argument syntax:
        //   //
        //   //      function fn(x : i32, y : i32, z : i32 = 0) { ... }
        //   const [pair] = node.params;

        //   // Short circuit the parsers since it does not make sense to process
        //   // assignment anymore. Instead parse the Pair, which is the argument.
        //   return transform([pair, context]);
        // },
        [Syntax.FunctionCall]: next => args => {
          const [call, context] = args;
          const { functions } = context;
          const [id, ...fnArgs] = call.params;

          const target = functions[id.value];

          // Most likely a built-in function
          if (!target) {
            return next(args);
          }

          const expectedArguments =
            target.meta.FUNCTION_METADATA.argumentsCount;
          const count = fnArgs.length;
          const difference = expectedArguments - count;
          if (difference > 0) {
            return next([
              {
                ...call,
                params: [
                  ...call.params,
                  ...target.meta.DEFAULT_ARGUMENTS.slice(difference - 1),
                ],
              },
              context,
            ]);
          }

          return next(args);
        },
      };
    },
  };
}
