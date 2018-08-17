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
        FunctionResult: next => ([result, context]) => {
          if (result.type === 'bool') {
            return next([{ ...result, type: 'i32' }, context]);
          }

          return next([result, context]);
        },
        Constant: next => ([constant, ...rest]) => {
          if (constant.type === 'bool') {
            return next([{ ...constant, type: 'i32' }]);
          }

          return next([constant, ...rest]);
        },
        Declaration: declaration,
        ImmutableDeclaration: declaration,
      };
    },
  };
}
