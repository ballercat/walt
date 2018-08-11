// @flow
import compile from '..';
import type { WebAssemblyModuleType } from '../flow/types';

// Make this a .walt file or pre-parse into an ast.
const source = `
  const memory: Memory = { initial: 1 };
  let heapPointer: i32 = 0;
  export function __closure_malloc(size: i32): i32 {
    const ptr: i32 = heapPointer;
    heapPointer += size;
    return ptr;
  }

  export function __closure_free(ptr: i32) {
  }

  // Getters
  export function __closure_get_i32(ptr: i32): i32 {
    const view: i32[] = ptr;
    return view[0];
  }

  export function __closure_get_f32(ptr: i32): f32 {
    const view: f32[] = ptr;
    return view[0];
  }

  export function __closure_get_i64(ptr: i32): i64 {
    const view: i64[] = ptr;
    return view[0];
  }

  export function __closure_get_f64(ptr: i32): f64 {
    const view: f64[] = ptr;
    return view[0];
  }

  // Setters
  export function __closure_set_i32(ptr: i32, value: i32) {
    const view: i32[] = ptr;
    view[0] = value;
  }

  export function __closure_set_f32(ptr: i32, value: f32) {
    const view: f32[] = ptr;
    view[0] = value;
  }

  export function __closure_set_i64(ptr: i32, value: i64) {
    const view: i64[] = ptr;
    view[0] = value;
  }

  export function __closure_set_f64(ptr: i32, value: f64) {
    const view: f64[] = ptr;
    view[0] = value;
  }
`;

export const mapToImports = (plugin: WebAssemblyModuleType) =>
  plugin.instance.exports;

export default function closurePlugin() {
  return compile(source, {
    version: 0x1,
    encodeNames: false,
    filename: 'walt-closure-plugin',
    lines: source.split('\n'),
  });
}
