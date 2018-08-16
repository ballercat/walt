import test from 'ava';
import compose from '../../utils/compose';
import compile, { debug, getIR } from '../..';

const walt = `export function _32BitSizes(): i32 {
  let x: i32;
  let y: f32;
  return sizeof(x) + sizeof(y);
}

export function _64BitSizes(): i32 {
  const x: i64 = 0;
  const y: f64 = 0;
  return sizeof(x) + sizeof(y);
}
type Type = { a: i32, b: i32, c: i32, d: i32 };
export function userDefinedObject(): i32 {
  const x: Type = 0;
  return sizeof(x);
}

export function userDefinedTypeName(): i32 {
  return sizeof(Type);
}

export function userDefinedFunctions() : i32 {
  return sizeof(userDefinedObject);
}
`;

test('type sizes', t => {
  const getWasm = compose(debug, getIR);
  const wasm = getWasm(walt);
  t.snapshot(wasm);
  return WebAssembly.instantiate(compile(walt)).then(result => {
    t.is(result.instance.exports._32BitSizes(), 8, '32 bit sizes combined');
    t.is(result.instance.exports._64BitSizes(), 16, '64 bit sizes combined');
    t.is(result.instance.exports.userDefinedObject(), 16, 'object types');
    t.is(result.instance.exports.userDefinedTypeName(), 16, 'type-name');
  });
});
