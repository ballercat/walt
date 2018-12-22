import test from 'ava';
import path from 'path';
import { harness } from '../../utils/test-utils';
import { compile } from '../..';
import { TextDecoder } from 'util';

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

  const importWASM = compile(imports);
  const sourceWASM = compile(source);
  return WebAssembly.instantiate(importWASM.buffer()).then(deps => {
    return WebAssembly.instantiate(sourceWASM.buffer(), {
      env: { ...deps.instance.exports },
    }).then(result => {
      const { run } = result.instance.exports;

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

test('union types and direct addressing', t => {
  const run = harness(path.resolve(__dirname, './union-type-spec.walt'), null, {
    prettyPrint: false,
  });

  return run(t).then(({ instance }) => {
    const memory = instance.exports.memory;
    const decoder = new TextDecoder();
    const pointer = instance.exports.run();
    const view = new DataView(memory.buffer);
    const byteLength = view.getUint32(pointer, true);
    const str = decoder.decode(
      memory.buffer.slice(pointer + 4, pointer + 4 + byteLength)
    );
    t.is(str, 'fooz', 'sanity check subscripts & text decoding');
  });
});
