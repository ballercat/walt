import compile from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const outputIs = (result, value) =>
  expect(result.instance.exports.test()).toBe(value);

test('equal', async () => {
  const out = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    return x == 0;
  }`);
  outputIs(out, 1);
});

test('not equal', async () => {
  const out = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 2;
    let y: i32 = x != 0;
    return y;
  }`);
  outputIs(out, 1);
});

test('greater than', async () => {
  const out = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 2;
    let y: i32 = 3;
    return y > x;
  }`);
  outputIs(out, 1);
});

test('less than', async () => {
  const out = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 3;
    let y: i32 = 2;
    return y < x;
  }`);
  outputIs(out, 1);
});
