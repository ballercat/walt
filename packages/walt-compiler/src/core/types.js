import Syntax from 'walt-syntax';
import { mapNode } from 'walt-parser-tools/map-node';
import walkNode from 'walt-parser-tools/walk-node';

export default function typePlugin() {
  return {
    semantics() {
      return {
        Typedef: _ => ([node]) => node,
        Program: next => args => {
          const [ast, context] = args;
          const { types } = context;
          // Types have to be pre-parsed before the rest of the program
          const astWithTypes = mapNode({
            [Syntax.Export]: (node, transform) => {
              const [maybeType] = node.params;
              if (
                maybeType != null &&
                [Syntax.Typedef, Syntax.Struct].includes(maybeType.Type)
              ) {
                return transform({
                  ...maybeType,
                  meta: {
                    ...maybeType.meta,
                    EXPORTED: true,
                  },
                });
              }
              return node;
            },
            [Syntax.Typedef]: (node, _) => {
              let argumentsCount = 0;
              const [fnArgs] = node.params;
              const defaultArgs = [];

              walkNode({
                Assignment(assignment) {
                  const defaultValue = assignment.params[1];
                  defaultArgs.push(defaultValue);
                },
                Type() {
                  argumentsCount += 1;
                },
              })(fnArgs);
              const parsed = {
                ...node,
                meta: {
                  ...node.meta,
                  FUNCTION_METADATA: {
                    argumentsCount,
                  },
                  DEFAULT_ARGUMENTS: defaultArgs,
                },
              };
              types[node.value] = parsed;
              return parsed;
            },
          })(ast);

          return next([astWithTypes, context]);
        },
      };
    },
  };
}
