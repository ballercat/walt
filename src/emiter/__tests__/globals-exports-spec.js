import test from 'ava';
import { u8, get } from 'wasm-types';
import { I32 } from '../value_type';
import { EXTERN_GLOBAL } from '../external_kind';
import emit from '..';

// TODO:
// the only way we can test output of globals is by exporting them
// should build in some assert() into the binary :)
const meaningOfLife = 42;
const ast = {
  Exports: [
    { kind: EXTERN_GLOBAL, field: 'meaningOfLife', index: 0 }
  ],
  Globals: [
    { immutable: true, type: I32, init: meaningOfLife }
  ]
};

test('compiles globals accurately', t => {
  const stream = emit(ast);
  return WebAssembly.instantiate(
    stream.buffer()
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  });
});

test('encodes correct values', t => {
  const stream = emit(ast);
  return WebAssembly.instantiate(
    stream.buffer()
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
    t.is(instance.exports.meaningOfLife, meaningOfLife);
  });
});
