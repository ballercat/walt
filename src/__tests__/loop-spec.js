import compile from '..';

const compileAndRun = (src, importsObj = {}) =>
  WebAssembly.instantiate(compile(src), importsObj);

const outputIs = (result, value, input) =>
  expect(result.instance.exports.test(input)).toBe(value);

test('for loop params', async () => {
  const result = await compileAndRun(`
   export function test(): i32 {
    let i: i32 = 10;
    let x: i32 = 0;
    for(i = 0; i < 3; i += 1) {
      x += i;
    }
    return x;
  }`);
  outputIs(result, 3);
});

test('for loop', async () => {
  const result = await compileAndRun(`
  export function test(x: i32): i32 {
    let y: i32 = 1;
    let i: i32 = 0;
    for(y = 0; y <= x; y += 1) {
      i = 0 - y;
    }
    return i;
  }`);
  outputIs(result, -5, 5);
});

test('while loop', async () => {
  const result = await compileAndRun(`
  export function test(x: i32): i32 {
    let y: i32 = 0;
    let i: i32 = 0;
    while(y <= x) {
      i = 0 - y;
      y += 1;
    }
    return i;
  }`);
  outputIs(result, -5, 5);
});

test('break', async () => {
  const result = await compileAndRun(`
  export function test() : i32 {
    let i: i32 = 0;
    let k: i32 = 0;
    for(i = 0; i < 10; i += 1) {
      if (i == 5) {
        break;
      }
    }
    return i;
  }`);
  outputIs(result, 5);
});
