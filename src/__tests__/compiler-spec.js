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

test('global declaration compilation', t =>
  WebAssembly.instantiate(
    compile('let answer: i32 = 42;')
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  })
);

test('global constant exports', t =>
  WebAssembly.instantiate(
    compile(`
      export const a: i32 = 42;
      export const b: f64 = 42.6;
    `)
  ).then(
    result => {
      t.is(result.instance.exports.a, 42);
      t.is(result.instance.exports.b, 42.6)
  })
);

test('function exports', t =>
  WebAssembly.instantiate(
    compile(`
      export function echo() : i32 {
        return 42;
      }
    `)
  ).then(
    result => {
      t.is(result.instance.exports.echo(), 42);
    }
  )
);


