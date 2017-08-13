import test from 'ava';
import compile from '..';

test('empty module compilation', t =>
  WebAssembly.instantiate(
    compile('')
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  })
);
