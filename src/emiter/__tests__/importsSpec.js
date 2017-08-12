import test from 'ava';
import { u8, get } from 'wasm-types';
import { I32 } from '../value_type';
import { IMPORT } from '../sectionCodes';
import { _GLOBAL } from '../external_kind';
import emit from '..';
import opcode from '../opcode';
import imports from '../imports';

const ast = {
  imports: {
    entries: [
      {
        module: 'a',
        field: 'b',
        kind: _GLOBAL,
        global: I32
      },
      {
        module: 'foo',
        field: 'bar',
        kind: _GLOBAL,
        global: I32
      }
    ]
  }
};

test('compiles imports accurately', t => {
  const stream = emit(ast);
  return WebAssembly.instantiate(
    stream.buffer(), { a: { b: 42 }, foo: { bar: 0xFFFFF } }
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  })
});
