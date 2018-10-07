/**
 * Static value plugin
 *
 * @flow
 */
import Syntax from 'walt-syntax';
import { stringEncoder } from '../utils/string';
import OutputStream from '../utils/output-stream';
import wasmTypes from 'wasm-types';
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

const sizeMap = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4,
};

function encodeArray(array, type) {
  const stream = new OutputStream();
  const encodeType = wasmTypes[type];
  array.forEach(v => {
    stream.push(encodeType, v, String(v));
  });

  return stream;
}

export default function Strings(): SemanticPlugin {
  let count = 0;
  return {
    semantics: () => ({
      [Syntax.StaticDeclaration]: _next => ([node, context], transform) => {
        const { userTypes, statics } = context;

        const bareType = String(node.type).slice(0, -2);
        const typeSize = sizeMap[bareType];

        const meta = node.params.reduce(
          (acc, v, i) => {
            const n = transform([v, context]);
            acc.OBJECT_SIZE += typeSize;
            acc.TYPE_OBJECT[i] = i * typeSize;
            acc.OBJECT_KEY_TYPES[i] = bareType;
            acc.VALUES.push(Number(n.value));
            return acc;
          },
          {
            OBJECT_SIZE: 0,
            TYPE_OBJECT: {},
            OBJECT_KEY_TYPES: {},
            VALUES: [],
          }
        );

        const uid = `__auto_gen_${node.value}_${count}`;
        count += 1;

        userTypes[uid] = {
          ...node,
          value: uid,
          Type: Syntax.Type,
          meta,
          params: [],
        };

        statics[uid] = encodeArray(meta.VALUES, bareType);

        // Short circuit the middleware and instead transform a declaration
        return transform([
          {
            ...node,
            type: uid,
            Type: Syntax.ImmutableDeclaration,
            params: [
              {
                ...node.params[0],
                value: uid,
                Type: Syntax.StaticValueList,
              },
            ],
          },
          context,
        ]);
      },
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
          statics[value] = stringEncoder(value);
        }

        // It's too early to transform a string at this point
        // we need additional information, only available in the generator.
        // This also avoids doing the work in two places, in semantics AND gen
        return stringLiteral;
      },
    }),
  };
}
