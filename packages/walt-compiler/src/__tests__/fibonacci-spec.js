import test from 'ava';
import { compileAndRun } from '../utils/test-utils';

const checks = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

// Spec showing if/then branches and recursive functions
test('fibonacci', t =>
  compileAndRun(`
    export function fibonacci(n: i32): i32 {
      if (n == 0) return 0;
      if (n == 1) return 1;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
  `).then(result => {
    const fib = result.instance.exports.fibonacci;
    checks.forEach((v, i) => t.is(fib(i), v));
  }));
