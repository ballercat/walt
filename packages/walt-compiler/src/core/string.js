/**
 * String plugin
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import type { SemanticPlugin } from '../flow/types';

const escapeMap = {
  ['\\0']: 0x00,
  ['\\a']: 0x07,
  ['\\b']: 0x08,
  ['\\t']: 0x09,
  ['\\n']: 0x0a,
  ['\\v']: 0x0b,
  ['\\f']: 0x0c,
  ['\\r']: 0x0d,
  ["\\'"]: 0x27,
};

export default function Strings(): SemanticPlugin {
  return {
    semantics: () => ({
      [Syntax.CharacterLiteral]: _ => ([node, context], transform) => {
        const codePoint = escapeMap[node.value] || node.value.codePointAt(0);

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
      [Syntax.StringLiteral]: _ignore => args => {
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
