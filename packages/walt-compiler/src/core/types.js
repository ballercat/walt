import curry from 'curry';
import Syntax from 'walt-syntax';
import { mapNode } from 'walt-parser-tools/map-node';
import walkNode from '../utils/walk-node';

const mapGeneric = curry((options, node, _) => {
  const { types } = options;
  const [generic, T] = node.params;
  const realType = types[T.value];
  const [args, result] = realType.params;
  // Patch the node to be a real type which we can reference later
  const patch = {
    ...realType,
    range: generic.range,
    value: node.value,
    meta: { ...realType.meta, CLOSURE_TYPE: generic.value === 'Lambda' },
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
});

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
              const defaultArgs = [];
              walkNode({
                Assignment(assignment) {
                  const defaultValue = assignment.params[1];
                  defaultArgs.push(defaultValue);
                },
                Type() {
                  argumentsCount += 1;
                },
              })(node);
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
            [Syntax.GenericType]: mapGeneric({ types }),
          })(ast);

          return next([astWithTypes, context]);
        },
      };
    },
  };
}
