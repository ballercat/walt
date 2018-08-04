import Syntax from '../Syntax';
import walkNode from '../utils/walk-node';
import { ALIAS, TYPE_OBJECT, OBJECT_KEY_TYPES } from '../semantics/metadata';

const patchStringSubscript = (byteOffsetsByKey, params) => {
  const field = params[1];
  const absoluteByteOffset = byteOffsetsByKey[field.value];
  return [
    params[0],
    {
      ...field,
      meta: { [ALIAS]: field.value },
      value: absoluteByteOffset,
      type: 'i32',
      Type: Syntax.Constant,
    },
  ];
};

export default function struct() {
  return {
    semantics() {
      return {
        Identifier: next => args => {
          const [node, context] = args;
          const { userTypes, locals, globals } = context;
          const local = locals[node.value] || globals[node.value];
          // Ignore anything not typed as a struct
          if (!(local && userTypes[local.type])) {
            return next(args);
          }

          // Convert all struct uses to i32 types
          return {
            ...node,
            meta: { ...node.meta, ...local.meta, ALIAS: local.type },
            type: 'i32',
          };
        },
        ArraySubscript: next => (args, transform) => {
          const [node, context] = args;
          const { userTypes, locals } = context;
          const params = node.params.map(p => transform([p, context]));
          const [identifier, field] = params;
          const local = locals[identifier.value];
          if (!local) {
            return next(args);
          }
          const userType = userTypes[local.type];
          if (userType != null) {
            const metaObject = userType.meta[TYPE_OBJECT];
            const objectKeyTypeMap = userType.meta[OBJECT_KEY_TYPES];
            return {
              ...node,
              type: objectKeyTypeMap ? objectKeyTypeMap[field.value] : 'i32',
              params: patchStringSubscript(metaObject, params),
            };
          }

          return next(args);
        },
        Assignment: next => (args, transform) => {
          const [node, context] = args;
          const [lhs, rhs] = node.params;

          if (!(rhs && rhs.Type === Syntax.ObjectLiteral)) {
            return next(args);
          }
          const individualKeys = {};
          const spreadKeys = {};
          // We have to walk the nodes twice, once for regular prop keys and then again
          // for ...(spread)
          walkNode({
            // Top level Identifiers _inside_ an object literal === shorthand
            // Notice that we ignore chld mappers in both Pairs and Spread(s) so the
            // only way this is hit is if the identifier is TOP LEVEL
            [Syntax.Identifier]: (identifier, _) => {
              individualKeys[identifier.value] = {
                ...lhs,
                Type: Syntax.MemoryAssignment,
                params: [
                  {
                    ...lhs,
                    Type: Syntax.ArraySubscript,
                    params: [lhs, identifier],
                  },
                  identifier,
                ],
              };
            },
            [Syntax.Pair]: (pair, _) => {
              const [property, value] = pair.params;
              individualKeys[property.value] = {
                ...lhs,
                Type: Syntax.MemoryAssignment,
                params: [
                  {
                    ...lhs,
                    Type: Syntax.ArraySubscript,
                    params: [lhs, property],
                  },
                  value,
                ],
              };
            },
            [Syntax.Spread]: (spread, _) => {
              // find userType
              const { locals, userTypes } = context;
              const [target] = spread.params;
              const userType = userTypes[locals[target.value].type];
              const keyOffsetMap = userType.meta[TYPE_OBJECT];
              if (keyOffsetMap != null) {
                // map over the keys
                Object.keys(keyOffsetMap).forEach(key => {
                  const offsetNode = {
                    ...target,
                    Type: Syntax.Identifier,
                    value: key,
                    params: [],
                  };
                  // profit
                  spreadKeys[key] = {
                    ...lhs,
                    Type: Syntax.MemoryAssignment,
                    params: [
                      {
                        ...lhs,
                        Type: Syntax.ArraySubscript,
                        params: [lhs, { ...offsetNode }],
                      },
                      {
                        ...target,
                        Type: Syntax.ArraySubscript,
                        params: [
                          target,
                          {
                            ...offsetNode,
                          },
                        ],
                      },
                    ],
                  };
                });
              }
            },
          })(rhs);

          const params = Object.values({ ...spreadKeys, ...individualKeys });

          return {
            ...lhs,
            Type: Syntax.Block,
            // We just created a bunch of MemoryAssignment nodes, map over them so that
            // the correct metadata is applied to everything
            params: params.map(p => transform([p, context])),
          };
        },
      };
    },
  };
}
