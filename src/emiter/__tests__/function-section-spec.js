import test from 'ava';
import { u8, get } from 'wasm-types';
import { I32 } from '../value_type';
import { EXTERN_FUNCTION } from '../external_kind';
import opcode from '../opcode';
import emit from '..';

// This ast structure tests more than just function sections.
// But for us to even test the function section we need to have
// types AND function bodies so here you go.
const meaningOfLife = 42;
const ast = {
  Types: [
    { params: [], result: I32 }
  ],
  Functions: [0],
  Code: [
    { locals: [], code: [ { kind: opcode.GetGlobal.code, params: [0] } ] }
  ],
  Exports: [
    { kind: EXTERN_FUNCTION, field: 'echo', index: 0 }
  ],
  Globals: [
    { kind: 'const', type: I32, init: meaningOfLife }
  ]
};

test('compiles functions accurately', t => {
  const stream = emit(ast);
  return WebAssembly.instantiate(
    stream.buffer()
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);

    // cool
    t.is(instance.exports.echo(), meaningOfLife);
  });
});

