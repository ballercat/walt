import { I32 } from '../value_type';
import { EXTERN_GLOBAL } from '../external_kind';
import emit from '..';

// TODO:
// the only way we can test output of globals is by exporting them
// should build in some assert() into the binary :)
const meaningOfLife = 42;
const ast = {
  Exports: [{ kind: EXTERN_GLOBAL, field: 'meaningOfLife', index: 0 }],
  Globals: [{ mutable: 0, type: I32, init: meaningOfLife }]
};

test('compiles globals accurately', async () => {
  const stream = emit(ast);
  const { module, instance } = await WebAssembly.instantiate(stream.buffer());
  expect(instance instanceof WebAssembly.Instance).toBe(true);
  expect(module instanceof WebAssembly.Module).toBe(true);
});

test('encodes correct values', async () => {
  const stream = emit(ast);
  const { module, instance } = await WebAssembly.instantiate(stream.buffer());
  expect(instance instanceof WebAssembly.Instance).toBe(true);
  expect(module instanceof WebAssembly.Module).toBe(true);
  expect(instance.exports.meaningOfLife).toBe(meaningOfLife);
});
