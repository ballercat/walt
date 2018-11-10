import test from 'ava';
import { compile } from '..';

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src).buffer(), imports);
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test('memory can be defined', t =>
  compileAndRun(
    `
  const memory: Memory<{ initial: 2, max: 2 }>;

  export function test(): i32 {
    let x: i32[] = 0;
    let y: i32 = 5;
    x[0] = 21;
    x[y] = 2;
    return x[0] * x[y];
  }`
  ).then(outputIs(t, 42)));

test('memory of any shape can be imported', t => {
  const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });
  // since initial 2 is higher than available this throws and proves that
  // generic memory type works
  t.throws(
    compileAndRun(
      'import { memory: Memory<{ initial: 2, max: 2 }> } from "env";',
      {
        env: { memory },
      }
    )
  );
  const view = new Int32Array(memory.buffer);
  view[1024] = 42;
  return compileAndRun(
    `
  import { memory: Memory<{initial: 1, max: 1 }> } from 'env';
  export function test(): i32 {
    const pointer: i32[] = 0;
    return pointer[1024];
  }
  `,
    { env: { memory } }
  ).then(outputIs(t, 42));
});

test('wide array offsets', t => {
  const SAFE_OFFSET = 65536;
  return WebAssembly.instantiate(
    compile(`
      export const memory: Memory<{initial: ${1 + (SAFE_OFFSET >> 16)}}>;
      export function populateArray(): f64 {
        const array: f64[] = ${SAFE_OFFSET};
        array[0] = 10 :f64;
        array[2] = 20 :f64;
        array[4] = 30 :f64;
        array[6] = 40 :f64;
        array[8] = 50 :f64;

        return array[4];
      }
  `).buffer(),
    {}
  ).then(({ instance }) => {
    const typedArray = new Float64Array(
      instance.exports.memory.buffer,
      SAFE_OFFSET,
      10
    ).fill(42);
    const result = instance.exports.populateArray();
    t.is(result, 30);
    t.snapshot(typedArray.toString());
  });
});
