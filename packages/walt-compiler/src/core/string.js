export default function Strings() {
  return {
    semantics: () => ({
      CharacterLiteral: _ => ([node, context], transform) => {
        const codePoint = node.value.codePointAt(0);

        return transform([
          {
            ...node,
            Type: 'Constant',
            type: 'i32',
            value: String(codePoint),
          },
          context,
        ]);
      },
      StringLiteral: _ignore => args => {
        const [stringLiteral, context] = args;
        const { statics } = context;
        const { value } = stringLiteral;

        // did we already encode the static?
        if (!(value in statics)) {
          statics[value] = null;
        }

        // It's too early to transform a string at this point
        // we need additional information, only available in the generator.
        // This also avoids doing the work in two places, in semantics AND gen
        return stringLiteral;
      },
    }),
  };
}
