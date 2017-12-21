import compile from '..';

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);

const outputIs = (result, value) =>
  expect(result.instance.exports.test()).toBe(value);

test('types and assignment', async () => {
  const result = await compileAndRun(`
    const memory: Memory = { 'initial': 1 };
    type TestType = { 'foo': i32, 'bar': i32 };
    export function test(): i32 {
      let obj: TestType = 0;

      obj['foo'] = 42;
      obj['bar'] = 20;

      return obj['foo'] + obj['bar'];
    }`);
  outputIs(result, 62);
});

test('object indexing and alignment', async () => {
  const result = await compileAndRun(`
    const memory: Memory = { 'initial': 1 };
    type TestType = { 'foo': i32, 'bar': i32 };
    export function test(): i32 {
      let obj: TestType = 0;
      let arr: i32[] = 0;

      obj['foo'] = 42;
      obj['bar'] = 20;

      return arr[0] + arr[1];
    }`);
  outputIs(result, 62);
});

test('float types', async () => {
  const result = await compileAndRun(`
    const memory: Memory = { 'initial': 1 };
    type TestType = { 'foo': i32 };
    export function test(): f32 {
      let obj: f32[] = 0;
      obj[1] = 2.0;

      return obj[1];
    }
    `);
  outputIs(result, 2);
});
