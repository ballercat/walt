import compile from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const checks = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

// Spec showing if/then branches and recursive functions
test('fibonacci', async () => {
  const result = await compileAndRun(`
  export function fibonacci(n: i32): i32 {
    if (n == 0)
      return 0;
    if (n == 1)
      return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
`);
  const fib = result.instance.exports.fibonacci;
  checks.forEach((v, i) => expect(fib(i)).toBe(v));
});
