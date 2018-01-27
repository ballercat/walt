// @flow
import compile from "..";

// Make this a .walt file or pre-parse into an ast.
const source = `
  const memory: Memory = { initial: 1 };
  let heapPointer: i32 = 0;
  export function make(size: i32): i32 {
    const ptr: i32 = heapPointer;
    heapPointer += 8;
    return ptr;
  }

  export function geti32(ptr: i32): i32 {
    const view: i32[] = ptr;
    return view[0];
  }

  export function seti32(ptr: i32, value: i32) {
    const view: i32[] = ptr;
    ptr[0] = value;
  }
`;

export default function make() {
  return compile(source);
}
