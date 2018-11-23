import test from 'ava';
import { compile } from 'walt-compiler';
import Benchmark from 'benchmark';
import branches from '../branches.walt';

test('simple branches', t => {
  const suite = new Benchmark.Suite();
  const iterations = 1000;

  return WebAssembly.instantiate(compile(branches).buffer()).then(
    ({ instance }) => {
      let r;
      const p = new Promise(_r => (r = _r));

      suite
        .add('if-then flat', function() {
          instance.exports.ifthen_simple(iterations, -1);
        })
        .add('select flat', () => {
          instance.exports.select_simple(iterations, -1);
        })
        .add('if-then nested', function() {
          instance.exports.ifthen_nested(iterations, -1);
        })
        .add('select nested', () => {
          instance.exports.select_nested(iterations, -1);
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
