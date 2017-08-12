import test from 'ava';
import { u8, get } from 'wasm-types';
import { I32 } from '../value_type';
import { EXTERN_GLOBAL } from '../external_kind';
import emit from '..';
import opcode from '../opcode';
import imports from '../imports';

const ast = {
  exports: [
    { field: 'foobar', kind: EXTERN_GLOBAL, index: 0 }
  ]
};

test.skip('compiles exports accurately', t => {
  const stream = emit(ast);
  console.log(stream.debug());
  return WebAssembly.instantiate(
    stream.buffer()
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  })
});
