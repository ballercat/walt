import test from 'ava';
import compile from '..';

const compileAndRun = (src, importsObj = {}) => WebAssembly.instantiate(compile(src), importsObj);

test('function typed imports', t =>
  // What is happening here:
  // We are creating a module which takes an import of console.log
  // we provide this import to the module in the second param. We
  // then invoke the test() function exported from the module and
  // test that the correct value was echo-ed back to us!
  new Promise(resolve => {
    compileAndRun(`
      import { log: Log } from 'env';
      type Log = (i32) => void;
      export function test(x: i32): void {
        log(42);
      }
    `, {
      env: {
        log: function(value) {
          t.is(value, 42);
          resolve();
        }
      }
    }).then(result => result.instance.exports.test(4434) );
  })
);

test.only('function pointers', t =>
  new Promise(resolve => {
    const table = new WebAssembly.Table({ element: 'anyfunc', initial: 10 });
    compileAndRun(`
      import { setTimeout: Later } from 'env';
      import { log: Log } from 'env';

      type Log = (i32) => void;
      type Later = (Function, i32) => void;

      function echo(): void {
        log(42);
      }

      export function test(): void {
        setTimeout(echo, 200);
      }
    `, {
       env: {
         table,
         log: function(value) {
           t.is(value, 42);
           resolve();
         },
         setTimeout: (functionPointer, timeout) => {
           const func = table.get(functionPointer);
           setTimeout(func, timeout);
         }
       }
    }).then(result => result.instance.exports.test());
  })
);

