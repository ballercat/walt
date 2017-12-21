import { I32 } from '../value_type';
import { EXTERN_FUNCTION } from '../external_kind';
import opcode from '../opcode';
import emit from '..';

// This ast structure tests more than just function sections.
// But for us to even test the function section we need to have
// types AND function bodies so here you go.
const meaningOfLife = 42;
const ast = {
  Types: [{ params: [], result: I32 }],
  Functions: [0],
  Code: [{ locals: [], code: [{ kind: opcode.GetGlobal, params: [0] }] }],
  Exports: [{ kind: EXTERN_FUNCTION, field: 'echo', index: 0 }],
  Globals: [{ mutable: 0, type: I32, init: meaningOfLife }]
};

test('compiles functions accurately', async () => {
  const stream = emit(ast);
  const { module, instance } = await WebAssembly.instantiate(stream.buffer());
  expect(instance instanceof WebAssembly.Instance).toBe(true);
  expect(module instanceof WebAssembly.Module).toBe(true);

  // cool
  expect(instance.exports.echo()).toBe(meaningOfLife);
});
