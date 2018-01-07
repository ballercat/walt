import test from "ava";
import compile, { debug, getIR } from "..";
import compose from "../utils/compose";

const walt = `export function constant(): f32 {
  return 0.5;
}
export function variableTypecast(): f32 {
  const x: i32 = 1;
  return (x: f32) + 5.0;
}
export function _32IntTypecast(): i32 {
  return (2.0: i32) + 2;
}
export function _32FloatTypecast(): f32 {
  return 2.5 + (2: f32) + 0.5;
}
export function _64IntTypecast(): i32 {
  const x: i64 = 2;
  return 2 + (x: i32);
}
export function _64FloatTypecast(x: f64): f32 {
  return 2 * (x : f32);
}
export function promotions(): f32 {
  return 2.5 + 2 + 0.5 * (10/ 5);
}`;

test("typecasts work", t => {
  const getWasm = compose(debug, getIR);
  const wasm = getWasm(walt);
  t.snapshot(wasm);
  return WebAssembly.instantiate(compile(walt)).then(result => {
    t.is(result.instance.exports.constant(), 0.5);
    t.is(result.instance.exports.variableTypecast(), 6);
    t.is(result.instance.exports._32IntTypecast(), 4);
    t.is(result.instance.exports._32FloatTypecast(), 5);
    t.is(result.instance.exports._64IntTypecast(), 4);
    t.is(result.instance.exports._64FloatTypecast(2), 4);
    t.is(result.instance.exports.promotions(), 5.5);
  });
});
