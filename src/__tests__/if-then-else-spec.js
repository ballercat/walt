import compile from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src));

const outputIs = (result, value) =>
  expect(result.instance.exports.test()).toBe(value);

test('inline if statement', async () => {
  const result = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    if (x < 2) x = 2;
    return x;
  }`);
  outputIs(result, 2);
});

test('inline if else', async () => {
  const result = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    if (x > 2)
      x = 0;
    else
      x = 42;
  return x;
  }`);
  outputIs(result, 42);
});

test('block if statement', async () => {
  const result = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 0;
    if (x < 2) {
      y = 2;
      x = y * 2;
    }
    return x;
  }`);
  outputIs(result, 4);
});

test('block if else statement', async () => {
  const result = await compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 0;
    if (x > 0) {
      y = 3;
    } else {
      y = 2;
    }
    x = y * 2;
    return x;
  }`);
  outputIs(result, 4);
});

test('ternary', async () => {
  const result = await compileAndRun(`
    export function test(): i32 {
      return 1 ? 42 : 24;
    }`);
  outputIs(result, 42);
});

// test('else if statement', async () => {
//   const { instance: { exports } } = await compileAndRun(`
//   export function test(x: i32): i32 {
//     if (x == 0) {
//       x = 2;
//     } else if (x == 1) {
//       x = 4;
//     } else {
//       x = 1;
//     }
//     return x;
//   }`);
//   expect(exports.test(0)).toBe(2);
//   expect(exports.test(1)).toBe(4);
//   expect(exports.test(-1)).toBe(1);
// });

// test('else if statement no curly braces', async () => {
//   const { instance: { exports } } = await compileAndRun(`
//   export function test(x: i32): i32 {
//     if (x == 0)
//       x = 2;
//     else if (x == 1)
//       x = 4;
//     else
//       x = 1;
//     return x;
//   }`);
//   console.log(exports.test(1));
//   expect(exports.test(0)).toBe(2);
//   expect(exports.test(1)).toBe(4);
//   expect(exports.test(-1)).toBe(1);
// });
