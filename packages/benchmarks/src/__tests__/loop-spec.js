import test from 'ava';
import { compile } from 'walt-compiler';
import Benchmark from 'benchmark';
import loops from '../loops.walt';

test('loops', t => {
  const suite = new Benchmark.Suite();
  const ITERATIONS = 1000;

  return WebAssembly.instantiate(compile(loops).buffer()).then(
    ({ instance }) => {
      let r;
      const p = new Promise(_r => (r = _r));

      suite
        .add('for-loop', function() {
          instance.exports.forLoop(ITERATIONS, -1);
        })
        .add('while loop', () => {
          instance.exports.whileLoop(ITERATIONS, -1);
        })
        .on('cycle', event => {
          console.log(String(event.target));
        })
        .on('complete', () => {
          r();
        })
        .run({ async: true });
      return p;
    }
  );
});
