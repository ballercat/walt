import defaultExample from "./default";
import memoryExample from "./memory";

const defaultSource = defaultExample.toString();
const memorySource = memoryExample.toString();

const DEFAULT_EXAMPLE = `const x: i32 = 2;
export function echo(): i32 {
  const x: i32 = 42;
  return x;
}`;

const MEMORY_EXAMPLE = `
export function test(): i32 {
  const arr: i32[] = new Array(10);
  arr[0] = 20;
  arr[1] = 15;
  return arr[0] + arr[1];
}`;

const examples = {
  Default: {
    js: defaultSource,
    code: DEFAULT_EXAMPLE
  },
  Memory: {
    js: memorySource,
    code: MEMORY_EXAMPLE
  }
};

export default examples;
