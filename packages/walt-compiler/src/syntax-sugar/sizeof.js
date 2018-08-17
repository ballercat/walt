import invariant from 'invariant';
import Syntax from '../Syntax';
import { OBJECT_SIZE } from '../semantics/metadata';

const sizes = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4,
};

export default function sizeofPlugin() {
  return {
    semantics() {
      return {
        FunctionCall: next => args => {
          const [sizeof, context] = args;

          if (sizeof.value !== 'sizeof') {
            return next(args);
          }

          const { locals, globals, userTypes, functions } = context;
          const [target] = sizeof.params;
          const local = locals[target.value];
          const { type = '' } = local || {};
          const global = globals[target.value];
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

          const node = local || global || func;

          return {
            ...sizeof,
            value: sizes[node ? node.type : target.value] || 4,
            type: 'i32',
            params: [],
            Type: Syntax.Constant,
          };
        },
      };
    },
  };
}
