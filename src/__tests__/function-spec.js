import test from 'ava';
import compile from '..';

const compileAndRun = (src, imports) => WebAssembly.instantiate(compile(src), imports);
const outputIs = (t, value) => result => t.is(result.instance.exports.test(), value);

test('function call', t =>
  compileAndRun(`
  function two(): i32 {
    return 2;
  }
  export function test(): i32 {
    return 2 + two();
  }`)
  .then(outputIs(t, 4))
);

test('function params', t =>
  compileAndRun(`
  function addTwo(x: i32): i32 {
    return x + 2;
  }
  export function test(): i32 {
    return addTwo(2);
  }`)
  .then(outputIs(t, 4))
);

test('function pointers', t => {
  const table = new WebAssembly.Table({ element: 'anyfunc', initial: 10 });
  return compileAndRun(`
      type Test = () => i32;

      function callback(pointer: Test): i32 {
        return pointer();
      }

      function result(): i32 {
        return 42;
      }

      export function test(): i32 {
        return callback(result);
      }
      `, {
        env: {
          table
        }
      })
    .then(outputIs(t, 42));
});

