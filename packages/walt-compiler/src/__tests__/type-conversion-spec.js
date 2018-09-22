import test from 'ava';
import { compile, debug, getIR } from '..';
import compose from '../utils/compose';

const walt = `export function constant(): f32 {
  return 0.5;
}
export function variableTypecast(x: i32): f32 {
  return (x: f32) + 5.0;
}
export function _32IntTypecast(x: f32): i32 {
  return (x: i32) + 2;
}
export function _32FloatTypecast(x: i32): f32 {
  return 2.5 + (x: f32) + 0.5;
}
// We cannot call this function from the outside with a i64 number :/
export function _64IntTypecast(): i32 {
  const x: i64 = 2;
  return (2 * x): i32;
}
export function _64FloatTypecast(x: f64): f32 {
  return (2 * x): f32;
}
export function promotions(): f32 {
  return 2.5 + 2 + 0.5 * (10/ 5);
}

export function promoteF32toF64(): f64 {
  const x: f64 = 2;
  const y: f32 = 2;
  return x + y;
}
`;

test('typecasts work', t => {
  const getWasm = compose(debug, getIR);
  const wasm = getWasm(walt);
  t.snapshot(wasm);
  return WebAssembly.instantiate(compile(walt).buffer()).then(result => {
    t.is(result.instance.exports.constant(), 0.5);
    t.is(result.instance.exports.variableTypecast(2), 7);
    t.is(result.instance.exports._32IntTypecast(2.0), 4);
    t.is(result.instance.exports._32FloatTypecast(2), 5);
    t.is(result.instance.exports._64IntTypecast(), 4);
    t.is(result.instance.exports._64FloatTypecast(2), 4);
    t.is(result.instance.exports.promotions(), 5.5);
    t.is(result.instance.exports.promoteF32toF64(), 4);
  });
});
