import compile from '..';

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);

const outputIs = (result, value) =>
  expect(result.instance.exports.test()).toBe(value);

test('function call', async () => {
  const result = await compileAndRun(`
function two(): i32 {
  return 2;
}
export function test(): i32 {
  return 2 + two();
}`);
  outputIs(result, 4);
});

test('function params', async () => {
  const result = await compileAndRun(`
function addTwo(x: i32): i32 {
  return x + 2;
}
export function test(): i32 {
  return addTwo(2);
}`);
  outputIs(result, 4);
});

test('function scope', async () => {
  const result = await compileAndRun(`
const x: i32 = 32;
export function test(): i32 {
  let x: i32 = 42;
  return x;
}`);
  outputIs(result, 42);
});

test('undefined function vars', () =>
  expect(() => {
    compileAndRun(`
  const x: i32 = 99;
  export function test(): i32 {
    let x: i32 = 42;
    return y;
  }`);
  }).toThrow());

test('void result type is optional', async () => {
  await compileAndRun(`export function test() {}`);
});

test('function pointers', async () => {
  const table = new WebAssembly.Table({ element: 'anyfunc', initial: 10 });
  const result = await compileAndRun(
    `
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
      `,
    {
      env: {
        table
      }
    }
  );
  outputIs(result, 42);
});

test('pointers as function arguments', async () => {
  const result = await compileAndRun(`
type Type = { 'a': i32 };
const memory: Memory = { 'initial': 1 };

function addOne(ptr: Type) {
  ptr['a'] += 1;
}
export function test(): i32 {
  let original: Type = 0;
  original['a'] = 4;
  addOne(original);
  return original['a'];
}`);
  outputIs(result, 5);
});
