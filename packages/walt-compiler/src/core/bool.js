/**
 * Bool plugin.
 * Converts boolean identifiers to i32 constants, handles declarations with
 * type "bool".
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import type { SemanticPlugin } from '../flow/types';

export default function booleanPlugin(): SemanticPlugin {
  return {
    semantics() {
      const declaration = next => ([decl, context]) => {
        if (decl.type === 'bool') {
          return next([{ ...decl, type: 'i32' }, context]);
        }

        return next([decl, context]);
      };
      return {
        [Syntax.Identifier]: next => (args, transform) => {
          const [id, context] = args;
          if (!(id.value === 'true' || id.value === 'false')) {
            return next(args);
          }

          return transform([
            {
              ...id,
              Type: Syntax.Constant,
              value: id.value === 'true' ? '1' : '0',
              type: 'i32',
            },
            context,
          ]);
        },
        [Syntax.FunctionResult]: next => ([result, context]) => {
          if (result.type === 'bool') {
            return next([{ ...result, type: 'i32' }, context]);
          }

          return next([result, context]);
        },
        [Syntax.Declaration]: declaration,
        [Syntax.ImmutableDeclaration]: declaration,
      };
    },
  };
}
