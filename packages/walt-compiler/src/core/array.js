/**
 * Array Plugin
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import invariant from 'invariant';
import { find } from 'walt-parser-tools/scope';
import { TYPE_ARRAY } from '../semantics/metadata';
import type { SemanticPlugin } from '../flow/types';
import print from '../utils/print-node';

const shiftAmount = {
  i32: 2,
  f32: 2,
  i64: 3,
  f64: 3,
};
export default function arrayPlugin(): SemanticPlugin {
  return {
    semantics({ stmt }) {
      const declaration = next => args => {
        const [node, context] = args;

        // For every declaration of array types we will strip the declaration type
        // to a core type (i32) and attach the original type reference as metadata
        if (node.type && node.type.endsWith('[]')) {
          return next([
            {
              ...node,
              type: 'i32',
              meta: { ...node.meta, [TYPE_ARRAY]: node.type.slice(0, -2) },
            },
            context,
          ]);
        }

        return next(args);
      };

      const arrayOffset = (base, offset) => {
        const shift = shiftAmount[base.meta[TYPE_ARRAY]];

        return offset
          ? stmt`(${base} + (${offset} << ${shift}));`
          : stmt`(${base});`;
      };

      return {
        [Syntax.Declaration]: declaration,
        [Syntax.ImmutableDeclaration]: declaration,
        [Syntax.Identifier]: next => args => {
          const [node, context] = args;
          const ref = find(context.scopes, node.value);
          // Before moving on to the core parser all identifiers need to have
          // concrete basic types
          if (ref && ref.meta[TYPE_ARRAY]) {
            return next([
              {
                ...node,
                type: ref.type,
                meta: { ...node.meta, ...ref.meta },
              },
              context,
            ]);
          }

          return next(args);
        },
        [Syntax.MemoryAssignment]: _ignore => (args, transform) => {
          const [node, context] = args;
          const [location, value] = node.params;
          const type = transform([value, context]).type;
          let index = location;
          if (location.Type === Syntax.ArraySubscript) {
            const [id, offset] = location.params.map(p =>
              transform([p, context])
            );
            index = arrayOffset(id, offset);
          }

          invariant(
            type,
            `PANIC - Undefined type for memory access: ${print(node)}`
          );

          return transform([stmt`${type}.store(${index}, ${value});`, context]);
        },
        [Syntax.ArraySubscript]: _ignore => (args, transform) => {
          const [node, context] = args;
          // To find out the type of this subscript we first must process it's
          // parameters <identifier, field>
          const params = node.params.map(p => transform([p, context]));
          const [identifier, offset] = params;
          const type = identifier.meta[TYPE_ARRAY];

          invariant(
            type,
            `PANIC - Undefined type for memory access: ${print(node)}`
          );

          return transform([
            stmt`${type}.load(${arrayOffset(identifier, offset)});`,
            context,
          ]);
        },
      };
    },
  };
}
