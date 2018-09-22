import test from 'ava';
import { compile, debug, getIR } from '../..';

// Passing in other WASM functions as ENV imports to another module causes
// the host to perform compile time Function definition validation for us.
//
// For this spec to fail the imported and exported function definition need to
// mismatch. This ensures that correct encoding is done on both sides!
test('type parsing', t => {
  const imports = `
  export function nothing() {}
  export function noparamsi32(): i32 { return 2; }
  export function i32void(v: i32): void {}
  export function i32i32(v: i32, c: i32) {}
  export function i32i32resulti32(v: i32, c: i32): i32 { return 2; }
  `;
  const source = `
  import {
    nothing: EmptyType,
    noparamsi32: NoParamsType,
    i32void: I32VoidType,
    i32i32: I32I32Type,
    i32i32resulti32: I32I32ResultI32Type
  } from 'env';
  type EmptyType = () => void;
  type NoParamsType = () => i32;
  type I32I32Type = (i32, i32) => void;
  type I32VoidType = (i32) => void;
  type I32I32ResultI32Type = (i32, i32) => i32;

  export function run(): i32 {
    return noparamsi32();
  }
  `;

  const importWASM = getIR(imports);
  const sourceWASM = getIR(source);
  return WebAssembly.instantiate(importWASM.buffer()).then(deps => {
    return WebAssembly.instantiate(sourceWASM.buffer(), {
      env: { ...deps.instance.exports },
    }).then(result => {
      const { run } = result.instance.exports;

      // snapshot both
      t.snapshot(debug(importWASM));
      t.snapshot(debug(sourceWASM));

      t.is(run(), 2);
    });
  });
});

test('invalid type definition', t => {
  const error = t.throws(() => compile('type Type = i32 => void;').buffer());
  t.snapshot(error);
});

test('export type statements compile', t => {
  t.notThrows(() => compile('export type Foo = (i32, i32) => i32;').buffer());
});
