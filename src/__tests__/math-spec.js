/**
 * Test JavaScript arithmetic operators
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators
 */
import compile from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const outputIs = (result, value) =>
  expect(result.instance.exports.test()).toBe(value);

test('addition', async () => {
  const result = await compileAndRun(
    `export function test() : i32 { return 2 + 2; }`
  );
  outputIs(result, 4);
});

test('subtraction', async () => {
  const result = await compileAndRun(
    `export function test(): i32 { return 4 - 2; }`
  );
  outputIs(result, 2);
});

test('multiplication', async () => {
  const result = await compileAndRun(
    `export function test(): i32 { return 2 * 2; }`
  );
  outputIs(result, 4);
});

test('division', async () => {
  const result = await compileAndRun(
    `export function test(): i32 { return 4 / 2; }`
  );
  outputIs(result, 2);
});

test('remainder', async () => {
  const result = await compileAndRun(
    'export function test(): i32 { return 5 % 2; }'
  );
  outputIs(result, 1);
});

// ** is not supported, use Math.pow(). Look into this
// test.skip('exponentiation', t =>
//   const result = await compileAndRun('export function test(): i32 { return 2 ** 2; }').then(outputIs(result, 1))
// );

test('decrement', async () => {
  const result = await compileAndRun(`
export function test(): i32 {
  let x: i32 = 2;
  x -= 1;
  return x;
}`);
  outputIs(result, 1);
});

test('increment', async () => {
  const result = await compileAndRun(`
export function test(): i32 {
  let y: i32 = 2;
  y+=1;
  return y;
}`);
  outputIs(result, 3);
});

// Unary negation is not supported. Workaround: "return 0 - x;"
test('unary negation', async () => {
  const result = await compileAndRun(`
export function test(): i32 {
  let x: i32 = 2;
  return -x;
}`);
  outputIs(result, -2);
});

test('uses precedence correctly', async () => {
  const result = await compileAndRun(`
export function test(): i32 {
  return 2 + 2 * 5 - 10;
}`);
  outputIs(result, 2);
});

test('brackets', async () => {
  const result = await compileAndRun(`
export function test(): i32 {
  return 2 + (2 - 1);
}`);
  outputIs(result, 3);
});

test('complex brackets', async () => {
  const result = await compileAndRun(`
   export function test(): i32 {
     return (2 * (3 - 1) - 1) / 3;
   }`);
  outputIs(result, 1);
});

test('array index & math', async () => {
  const result = await compileAndRun(`
  const memory: Memory = { 'initial': 1 };
  export function test(): i32 {
    const x: i32[] = 0;
    x[0] = 7;
    x[0] = -x[0];
    return x[0];
  }`);
  outputIs(result, -7);
});
