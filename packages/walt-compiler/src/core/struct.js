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
import { TYPE_OBJECT, OBJECT_KEY_TYPES } from '../semantics/metadata';
import print from '../utils/print-node';
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

const toStruct = (context, node) => {
  const { userTypes, scopes } = context;
  const base = find(scopes, node.value);

  if (base == null || userTypes[base.type] == null) {
    return null;
  }

  const userType = userTypes[base.type];

  const objectKeyTypeMap = userType.meta[OBJECT_KEY_TYPES];
  const offsetMap = userType.meta[TYPE_OBJECT];

  return {
    offsetMap,
    base: node,
    field(field) {
      const type = (() => {
        const ft = objectKeyTypeMap[field.value];
        console.log(objectKeyTypeMap, ft, field.value);
        if (userTypes[ft]) {
          return STRUCT_NATIVE_TYPE;
        }

        if (ft && ft.indexOf('[]') > -1) {
          return ft.slice(0, -2);
        }

        return ft;
      })();
      const offset = offsetMap[field.value];

      return { offset, type };
    },
  };
};

export default function Struct(): SemanticPlugin {
  return {
    semantics({ stmt }) {
      const structOffset = (base, offset) => {
        return offset ? stmt`(${base} + ${offset});` : stmt`(${base});`;
      };

      return {
        [Syntax.Struct]: _ => ([node, { userTypes }]) => {
          const [offsetsByKey, totalSize, keyTypeMap] = getByteOffsetsAndSize(
            node.params[0]
          );
          const structNode = {
            ...node,
            meta: {
              ...node.meta,
              [TYPE_OBJECT]: offsetsByKey,
              OBJECT_SIZE: totalSize,
              [OBJECT_KEY_TYPES]: keyTypeMap,
            },
          };

          userTypes[structNode.value] = structNode;
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
          const { userTypes, scopes } = context;
          const ref = find(scopes, node.value);
          // Ignore anything not typed as a struct
          if (!(ref && userTypes[ref.type])) {
            return next(args);
          }

          // Convert all struct uses to STRUCT_NATIVE_TYPE types
          return {
            ...node,
            meta: { ...node.meta, ...ref.meta, ALIAS: ref.type },
            type: STRUCT_NATIVE_TYPE,
          };
        },
        [Syntax.Access]: next => (args, transform) => {
          const [node, context] = args;
          // const params = node.params.map(p => transform([p, context]));
          // const [lookup, key] = params;
          const [lookup, key] = node.params;
          const struct = toStruct(context, lookup);
          if (struct == null) {
            return next(args);
          }
          const field = struct.field(key);

          invariant(
            field.type,
            'PANIC - Undefined type for memory access' + `\n${print(node)}`
          );
          return transform([
            stmt`${field.type}.load(${structOffset(lookup, field.offset)});`,
            context,
          ]);
        },
        [Syntax.MemoryAssignment]: next => (args, transform) => {
          const [node, context] = args;
          const [lhs, rhs] = node.params;
          const [lookup, key] = lhs.params;
          console.log(lookup);
          const struct = toStruct(context, lookup);

          if (struct == null) {
            return next(args);
          }

          const field = struct.field(key);

          invariant(
            field.type,
            'PANIC - Undefined type for memory access' + `\n${print(node)}`
          );

          return transform([
            stmt`${field.type}.store(
            ${structOffset(struct.base, field.offset)},
            ${rhs}
          );`,
            context,
          ]);
        },
        [Syntax.Assignment]: next => (args, transform) => {
          const [node, context] = args;
          const [lhs, rhs] = node.params;
          const struct = toStruct(context, lhs);

          if (!(rhs && rhs.Type === Syntax.ObjectLiteral) || struct == null) {
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
              const field = struct.field(identifier);
              individualKeys[identifier.value] = stmt`${field.type}.store(
                ${structOffset(lhs, field.offset)},
                ${identifier}
              );`;
            },
            [Syntax.Pair]: (pair, _) => {
              const [property, value] = pair.params;
              const field = struct.field(property);

              individualKeys[property.value] = stmt`${field.type}.store(
                ${structOffset(lhs, field.offset)},
                ${value}
              );`;
            },
            [Syntax.Spread]: (spread, _) => {
              // find userType
              const [target] = spread.params;
              // map over the keys
              Object.keys(struct.offsetMap).forEach(key => {
                const field = struct.field({ value: key });
                spreadKeys[key] = stmt`${field.type}.store(
                  ${structOffset(lhs, field.offset)},
                  ${field.type}.load(${structOffset(target, field.offset)})
                );`;
              });
            },
          })(rhs);

          // $FlowFixMe - Flow is dumb sometimes. clearly values here are all NodeType
          const params: NodeType[] = Object.values({
            ...spreadKeys,
            ...individualKeys,
          }).map(p => transform([p, context]));

          return {
            ...lhs,
            Type: Syntax.Block,
            params: params,
          };
        },
      };
    },
  };
}
