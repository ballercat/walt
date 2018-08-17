import Syntax from '../Syntax';
import { GLOBAL_INDEX } from '../semantics/metadata';

export default function memoryPlugin() {
  return {
    semantics() {
      return {
        Identifier: next => args => {
          const [identifier] = args;
          if (identifier.value === '__DATA_LENGTH__') {
            return {
              ...identifier,
              type: 'i32',
              Type: Syntax.ArraySubscript,
              params: [
                {
                  ...identifier,
                  type: 'i32',
                  value: '0',
                  Type: Syntax.Constant,
                },
                {
                  ...identifier,
                  type: 'i32',
                  value: '0',
                  Type: Syntax.Constant,
                },
              ],
            };
          }

          return next(args);
        },
        ImmutableDeclaration: next => args => {
          const [decl, context] = args;

          // Short circuit since memory is a special type of declaration
          if (!context.locals && decl.type === 'Memory') {
            return {
              ...decl,
              meta: {
                ...decl.meta,
                [GLOBAL_INDEX]: -1,
              },
            };
          }

          return next(args);
        },
      };
    },
  };
}
