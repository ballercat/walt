/**
 * Sizeof helper plugin. Maps size(<THING>) to a static i32 constant
 *
 * @flow
 */
import invariant from 'invariant';
import { find } from 'walt-parser-tools/scope';
import Syntax from 'walt-syntax';
import { OBJECT_SIZE } from '../semantics/metadata';
import type { SemanticPlugin } from '../flow/types';

const sizes = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4,
};

export default function sizeofPlugin(): SemanticPlugin {
  return {
    semantics() {
      return {
        [Syntax.FunctionCall]: next => args => {
          const [sizeof, context] = args;

          if (sizeof.value !== 'sizeof') {
            return next(args);
          }

          const { scopes, userTypes, functions } = context;
          const [, target] = sizeof.params;
          const ref = find(scopes, target.value);
          const { type = '' } = ref || {};
          const userType = userTypes[target.value] || userTypes[type];
          const func = functions[target.value];

          if (userType != null) {
            const metaSize = userType.meta[OBJECT_SIZE];
            invariant(metaSize, 'Object size information is missing');
            return {
              ...sizeof,
              value: metaSize,
              params: [],
              type: 'i32',
              Type: Syntax.Constant,
            };
          }

          const node = ref || func;

          return {
            ...sizeof,
            value: sizes[String(node ? node.type : target.value)] || '4',
            type: 'i32',
            params: [],
            Type: Syntax.Constant,
          };
        },
      };
    },
  };
}
