/**
 * Structs Plugin
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import invariant from 'invariant';
import { find } from 'walt-parser-tools/scope';
import walkNode from 'walt-parser-tools/walk-node';
import { extendNode } from '../utils/extend-node';
import { ALIAS, TYPE_OBJECT, OBJECT_KEY_TYPES } from '../semantics/metadata';
import type { NodeMap, NodeType, SemanticPlugin } from '../flow/types';

const sizeMap = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4,
};
const STRUCT_NATIVE_TYPE = 'i32';

export const getByteOffsetsAndSize = (objectLiteralNode: NodeType) => {
  const offsetsByKey = {};
  const keyTypeMap = {};
  let size = 0;
  walkNode({
    [Syntax.Pair]: keyTypePair => {
      const { value: key } = keyTypePair.params[0];
      const { value: typeString } = keyTypePair.params[1];
      invariant(
        offsetsByKey[key] == null,
        `Duplicate key ${key} not allowed in object type`
      );

      keyTypeMap[key] = typeString;
      offsetsByKey[key] = size;
      size += sizeMap[typeString] || 4;
    },
  })(objectLiteralNode);

  return [offsetsByKey, size, keyTypeMap];
};

const accessToNative = ({ target, offset, type, fragment }) => {
  let base = target;
  const load = fragment(`(${type}.load())`);
  // if (target.type !== 'i32') {
  //   base = fragment(`(${target.value} : i32)`);
  // } else {
  //   base = target;
  // }

  if (!offset) {
    return extendNode(
      {
        params: [load.params[0], base],
      },
      load
    );
  }

  return extendNode(
    {
      params: [
        load.params[0],
        (() => {
          const add = fragment(`(0 + ${offset})`);
          add.params[0] = base;
          return add;
        })(),
      ],
    },
    load
  );
};

const patchStringSubscript = ({ fragment, byteOffsetsByKey, params }) => {
  const field = params[1];
  const absoluteByteOffset = byteOffsetsByKey[field.value];
  // const cast = fragment(`(${params[0].value} : i32)`);
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

export default function Struct(): SemanticPlugin {
  return {
    semantics({ fragment }) {
      return {
        [Syntax.Declaration]: next => ([node, context]) => {
          // Convert the type of declaration down to a proper NATIVE type
          if (context.userTypes[node.type]) {
            return next([
              extendNode(
                {
                  type: STRUCT_NATIVE_TYPE,
                  meta: { ALIAS: node.type },
                },
                node
              ),
              context,
            ]);
          }

          return next([node, context]);
        },
        [Syntax.Struct]: _ => ([node, { userTypes }]) => {
          const [offsetsByKey, totalSize, keyTypeMap] = getByteOffsetsAndSize(
            node.params[0]
          );
          const struct = {
            ...node,
            meta: {
              ...node.meta,
              [TYPE_OBJECT]: offsetsByKey,
              OBJECT_SIZE: totalSize,
              [OBJECT_KEY_TYPES]: keyTypeMap,
            },
          };

          userTypes[struct.value] = struct;
          return struct;
        },
        [Syntax.FunctionResult]: next => (args, transform) => {
          const [node, context] = args;
          const { userTypes } = context;
          if (!userTypes[String(node.type)]) {
            return next(args);
          }

          return next([
            extendNode(
              {
                type: STRUCT_NATIVE_TYPE,
                meta: { ALIAS: node.type },
                params: node.params.map(p => transform([p, context])),
              },
              node
            ),
            context,
          ]);
        },
        [Syntax.Identifier]: next => args => {
          const [node, context] = args;
          const { scopes } = context;
          const ref = find(scopes, node.value);
          // Ignore anything not typed as a struct
          if (!(ref && ref.meta.ALIAS)) {
            return next(args);
          }

          // Convert all struct uses to STRUCT_NATIVE_TYPE types
          return {
            ...node,
            meta: { ...node.meta, ...ref.meta },
            type: STRUCT_NATIVE_TYPE,
          };
        },
        [Syntax.ArraySubscript]: next => (args, transform) => {
          const [node, context] = args;
          const { userTypes, scopes } = context;
          const params = node.params.map(p => transform([p, context]));
          const [lookup, field] = params;

          const ref = find(scopes, lookup.value);
          const userType = ref && userTypes[ref.meta.ALIAS];

          if (userType != null) {
            const metaObject = userType.meta[TYPE_OBJECT];
            const objectKeyTypeMap = userType.meta[OBJECT_KEY_TYPES];
            const type = (() => {
              const ft = objectKeyTypeMap[field.value];
              if (userTypes[ft]) {
                return STRUCT_NATIVE_TYPE;
              }

              return ft;
            })();

            return {
              ...node,
              value: `${lookup.value}.${field.value}`,
              type,
              meta: { ...node.meta, ALIAS: userType.value },
              Type: Syntax.Access,
              params: patchStringSubscript({
                fragment,
                byteOffsetsByKey: metaObject,
                params,
                context,
              }).map(p => transform([p, context])),
            };
          }

          return next(args);
        },
        [Syntax.Access]: next => (args, transform) => {
          const [node, context] = args;
          const { userTypes, scopes } = context;
          const params = node.params.map(p => transform([p, context]));
          const [lookup, field] = params;
          const ref = find(scopes, lookup.value);

          if (!(ref && ref.meta.ALIAS)) {
            return next(args);
          }
          const userType = userTypes[String((ref || lookup).meta.ALIAS)];

          const metaObject = userType.meta[TYPE_OBJECT];
          const objectKeyTypeMap = userType.meta[OBJECT_KEY_TYPES];
          const type = (() => {
            const ft = objectKeyTypeMap[field.value];
            if (userTypes[ft]) {
              return STRUCT_NATIVE_TYPE;
            }

            return ft;
          })();

          const native = accessToNative({
            type,
            target: lookup,
            offset: metaObject[field.value],
            fragment,
          });

          return transform([native, context]);

          // return {
          //   ...node,
          //   value: `${lookup.value}.${field.value}`,
          //   meta: {
          //     ...node.meta,
          //     ALIAS: userType.value,
          //     TYPE_ARRAY: String(type).includes('[]')
          //       ? type.slice(0, -2)
          //       : null,
          //   },
          //   type: String(type).replace('[]', ''),
          //   params: patchStringSubscript({
          //     fragment,
          //     byteOffsetsByKey: metaObject,
          //     params,
          //     context,
          //   }).map(p => transform([p, context])),
          // };
        },
        [Syntax.Assignment]: next => (args, transform) => {
          const [node, context] = args;
          const [lhs, rhs] = node.params;

          if (!(rhs && rhs.Type === Syntax.ObjectLiteral)) {
            return next(args);
          }
          const individualKeys: NodeMap = {};
          const spreadKeys: NodeMap = {};
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
              const { scopes, userTypes } = context;
              const [target] = spread.params;
              const userType = userTypes[find(scopes, target.value).type];
              const keyOffsetMap = userType.meta[TYPE_OBJECT];
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
            },
          })(rhs);

          // $FlowFixMe - Flow is dumb sometimes. clearly values here are all NodeType
          const params: NodeType[] = Object.values({
            ...spreadKeys,
            ...individualKeys,
          });

          return {
            ...lhs,
            Type: Syntax.Block,
            // We just created a bunch of MemoryAssignment nodes, map over them so that
            // the correct metadata is applied to everything
            params: params.map((p: NodeType) => transform([p, context])),
          };
        },
      };
    },
  };
}
