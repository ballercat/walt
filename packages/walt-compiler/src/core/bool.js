import Syntax from 'walt-syntax';

export default function booleanPlugin() {
  return {
    semantics() {
      const declaration = next => ([decl, context]) => {
        if (decl.type === 'bool') {
          return next([{ ...decl, type: 'i32' }, context]);
        }

        return next([decl, context]);
      };
      return {
        Identifier: next => (args, transform) => {
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
        FunctionResult: next => ([result, context]) => {
          if (result.type === 'bool') {
            return next([{ ...result, type: 'i32' }, context]);
          }

          return next([result, context]);
        },
        Declaration: declaration,
        ImmutableDeclaration: declaration,
      };
    },
  };
}
