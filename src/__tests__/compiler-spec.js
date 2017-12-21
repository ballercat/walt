import compile from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src));

test('empty module compilation', async () => {
  const { module, instance } = await compileAndRun('');
  expect(instance instanceof WebAssembly.Instance).toBe(true);
  expect(module instanceof WebAssembly.Module).toBe(true);
});

test('global declaration compilation', async () => {
  const { module, instance } = await compileAndRun('let answer: i32 = 42;');
  expect(instance instanceof WebAssembly.Instance).toBe(true);
  expect(module instanceof WebAssembly.Module).toBe(true);
});

test('global constant exports', async () => {
  const result = await compileAndRun(`
    export const a: i32 = 42;
    export const b: f64 = 42.6;
`);
  expect(result.instance.exports.a).toBe(42);
  expect(result.instance.exports.b).toBe(42.6);
});

test('function exports', async () => {
  const result = await compileAndRun(`
    export function echo() : i32 {
      return 48;
    }
  `);
  expect(result.instance.exports.echo()).toBe(48);
});

test('function locals', async () => {
  const result = await compileAndRun(`
  export function echo() : i32 {
    const x : i32 = 42;
    return x;
  }
`);
  expect(result.instance.exports.echo()).toBe(42);
});

test('function scope', async () => {
  const result = await compileAndRun(`
  const x : i32 = 11;
  export function test() : i32 {
    const x : i32 = 42;
    return x;
  }
`);
  expect(result.instance.exports.test()).toBe(42);
});

test('global reference in function scope', async () => {
  const result = await compileAndRun(`
  const x : i32 = 42;
  export function test() : i32 {
    return x;
  }
`);
  expect(result.instance.exports.test()).toBe(42);
});

test('compiles large signed consants correctly', async () => {
  const result = await compileAndRun(`
  export function test(): i32 {
    return 126;
  }
`);
  expect(result.instance.exports.test()).toBe(126);
});

test('compiles large signed global consants correctly', async () => {
  const result = await compileAndRun(`
  const x: i32 = 126;
  export function test(): i32 {
    return x;
  }
`);
  expect(result.instance.exports.test()).toBe(126);
});

test('compiles math', async () => {
  const result = await compileAndRun(`
  export function test(): i32 {
    return 2 + 2 - 4;
  }
`);
  expect(result.instance.exports.test()).toBe(0);
});
