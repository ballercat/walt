import emit from '../';

test('emitter, emits valid WebAssembly instance', async () => {
  const output = emit();
  const { module, instance } = await WebAssembly.instantiate(output.buffer());
  expect(instance instanceof WebAssembly.Instance).toBe(true);
  expect(module instanceof WebAssembly.Module).toBe(true);
});
