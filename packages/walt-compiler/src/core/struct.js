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
import type { NodeType, SemanticPlugin } from '../flow/types';

type FieldType = { type: string, offset: number };

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

const toStruct = node => {
  // Lookup the Struct Type so that any expression returning a struct
  // works as a base offset
  if (node.meta.STRUCT_TYPE == null) {
    return null;
  }

  const typedef = node.meta.STRUCT_TYPE;
  const offsetMap = typedef.meta.TYPE_OBJECT;
  const typeMap = typedef.meta.OBJECT_KEY_TYPES;

  return {
    base: node,
    typedef,
    offsetMap,
    typeMap,
    field(field: { value: string, type?: string }) {
      if (offsetMap[field.value] == null) {
        return null;
      }
      let type = typeMap[field.value] || field.type;
      const offset = offsetMap[field.value];
      let STRUCT_TYPE = null;
      let TYPE_ARRAY = null;

      // Nested stuct type access
      if (type != null && typeof type === 'object') {
        STRUCT_TYPE = type;
        type = STRUCT_NATIVE_TYPE;
      }

      if (String(type).endsWith('[]')) {
        TYPE_ARRAY = type.slice(0, -2);
        type = 'i32';
      }

      return { offset, type, STRUCT_TYPE, TYPE_ARRAY };
    },
  };
};

export default function Struct(): SemanticPlugin {
  return {
    semantics({ stmt }) {
      const structOffset = (base, offset) => {
        return offset ? stmt`(${base} + ${offset});` : stmt`(${base});`;
      };

      function access(_next) {
        return (args, transform) => {
          const [node, context] = args;
          const [lookup, key] = node.params;
          const struct = toStruct(transform([lookup, context]));

          invariant(
            struct,
            `PANIC - Cannot access properties of ${lookup.value}`
          );

          const field = struct.field(key);

          invariant(
            field,
            `PANIC - Cannot access property ${key.value} on ${lookup.value}`
          );

          return extendNode(
            {
              meta: {
                STRUCT_TYPE: field.STRUCT_TYPE,
                TYPE_ARRAY: field.TYPE_ARRAY,
              },
            },
            transform([
              stmt`${field.type}.load(${structOffset(lookup, field.offset)});`,
              context,
            ])
          );
        };
      }

      function store(base, field: FieldType, rhs) {
        return stmt`${field.type}.store(
          ${structOffset(base, field.offset)},
          ${rhs}
        );`;
      }

      function fieldAssignment(args, transform) {
        const [node, context] = args;
        const [lhs, rhs] = node.params;
        const [root, key] = lhs.params;
        const struct = toStruct(transform([root, context]));

        if (struct == null) {
          return node;
        }

        const field = struct.field(key);
        if (field == null) {
          return node;
        }

        return transform([store(struct.base, field, rhs), context]);
      }

      function objectAssignment(args, transform) {
        const [node, context] = args;
        const [lhs, rhs] = node.params;
        const struct = toStruct(transform([lhs, context]));

        invariant(
          struct,
          `PANIC - Cannot use object assignment on ${lhs.value}`
        );

        const kvs = [];

        // We have to walk the nodes twice, once for regular prop keys and then again
        // for ...(spread)
        walkNode({
          // Top level Identifiers _inside_ an object literal === shorthand
          // Notice that we ignore chld mappers in both Pairs and Spread(s) so the
          // only way this is hit is if the identifier is TOP LEVEL
          [Syntax.Identifier]: (value, _) => {
            const field = struct.field(value);
            kvs.push({ field, value });
          },
          [Syntax.Pair]: (pair, _) => {
            const [property, value] = pair.params;
            const field = struct.field(property);
            kvs.push({ field, value });
          },
          [Syntax.Spread]: (spread, _) => {
            // find userType
            const [target] = spread.params;
            // map over the keys
            Object.keys(struct.offsetMap).forEach(key => {
              const field = struct.field({ value: key });

              invariant(field != null, `PANIC - undefined object key "${key}`);

              kvs.push({
                field,
                value: stmt`${field.type}.load(${structOffset(
                  target,
                  field.offset
                )});`,
              });
            });
          },
        })(rhs);

        const params: NodeType[] = kvs
          .filter(({ field }) => field != null)
          /* $FlowFixMe */
          .map(kv => transform([store(lhs, kv.field, kv.value), context]));

        return {
          ...lhs,
          Type: Syntax.Block,
          params: params,
        };
      }

      return {
        [Syntax.Struct]: _ => ([node, { userTypes }]) => {
          const [union] = node.params;

          const structNode = {
            ...node,
            meta: {
              ...node.meta,
              TYPE_OBJECT: {},
              OBJECT_SIZE: 0,
              OBJECT_KEY_TYPES: {},
            },
          };

          walkNode({
            [Syntax.ObjectLiteral]: obj => {
              const [offsets, size, typeMap] = getByteOffsetsAndSize(obj);
              structNode.meta.TYPE_OBJECT = {
                ...structNode.meta.TYPE_OBJECT,
                ...offsets,
              };
              structNode.meta.OBJECT_SIZE += size;
              structNode.meta.OBJECT_KEY_TYPES = {
                ...structNode.meta.OBJECT_KEY_TYPES,
                ...typeMap,
              };
            },
            [Syntax.Type]: type => {
              if (String(type.type).endsWith('[]')) {
                structNode.meta.TYPE_ARRAY = type.type.slice(0, -2);
              }
            },
          })(union);

          userTypes[structNode.value] = structNode;

          // Map over the strings for key types and replace them with struct
          // references where necessary. We do this after creating the object
          // to allow for self-referencing structs (linked lists etc)
          structNode.meta.OBJECT_KEY_TYPES = Object.entries(
            structNode.meta.OBJECT_KEY_TYPES
          ).reduce((acc, [key, value]) => {
            acc[key] = userTypes[value] || value;
            return acc;
          }, {});

          return structNode;
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
                meta: { STRUCT_TYPE: userTypes[node.type] },
                params: node.params.map(p => transform([p, context])),
              },
              node
            ),
            context,
          ]);
        },
        [Syntax.Identifier]: next => args => {
          const [node, context] = args;
          const { userTypes, scopes } = context;
          const ref = find(scopes, node.value);
          // Ignore anything not typed as a struct
          if (!(ref && userTypes[ref.type])) {
            return next(args);
          }

          // Convert all struct uses to STRUCT_NATIVE_TYPE types
          return {
            ...node,
            meta: {
              ...node.meta,
              ...ref.meta,
              STRUCT_TYPE: userTypes[ref.type],
            },
            type: STRUCT_NATIVE_TYPE,
          };
        },
        [Syntax.Access]: access,
        [Syntax.Assignment]: next => (args, transform) => {
          const [node] = args;
          const [lhs, rhs] = node.params;

          if (lhs.Type === Syntax.Access) {
            return fieldAssignment(args, transform);
          }

          if (rhs.Type === Syntax.ObjectLiteral) {
            return objectAssignment(args, transform);
          }

          return next(args);
        },
      };
    },
  };
}
