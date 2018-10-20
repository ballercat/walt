/**
 * Array Plugin
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import { find } from 'walt-parser-tools/scope';
import { TYPE_ARRAY } from '../semantics/metadata';
import type { SemanticPlugin } from '../flow/types';

export default function arrayPlugin(): SemanticPlugin {
  return {
    semantics() {
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
        [Syntax.ArraySubscript]: _ignore => (args, transform) => {
          const [node, context] = args;

          // To find out the type of this subscript we first must process it's
          // parameters <identifier, field>
          const params = node.params.map(p => transform([p, context]));

          const [identifier] = params;

          const type = identifier.meta[TYPE_ARRAY];

          return {
            ...node,
            params,
            type,
          };
        },
      };
    },
  };
}
