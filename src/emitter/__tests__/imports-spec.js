import { I32 } from '../value_type';
import { EXTERN_GLOBAL } from '../external_kind';
import emit from '..';

const ast = {
  Imports: [
    {
      module: 'a',
      field: 'b',
      kind: EXTERN_GLOBAL,
      global: I32
    },
    {
      module: 'foo',
      field: 'bar',
      kind: EXTERN_GLOBAL,
      global: I32
    }
  ]
};

test('compiles imports accurately', async () => {
  const stream = emit(ast);
  const { module, instance } = await WebAssembly.instantiate(stream.buffer(), {
    a: { b: 42 },
    foo: { bar: 0xfffff }
  });
  expect(instance instanceof WebAssembly.Instance).toBe(true);
  expect(module instanceof WebAssembly.Module).toBe(true);
});
