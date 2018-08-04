import { GLOBAL_INDEX } from '../semantics/metadata';

export default function functionPointer() {
  return {
    semantics() {
      return {
        ImmutableDeclaration: next => args => {
          const [decl, context] = args;

          // Short circuit since memory is a special type of declaration
          if (!context.locals && decl.type === 'Table') {
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
