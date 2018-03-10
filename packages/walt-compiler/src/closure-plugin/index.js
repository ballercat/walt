// @flow
import compile from "..";
import {
  CLOSURE_SET,
  CLOSURE_GET,
  CLOSURE_FREE,
  CLOSURE_MALLOC,
} from "../semantics/closure";
import type { WebAssemblyModuleType } from "../flow/types";

// Make this a .walt file or pre-parse into an ast.
const source = `
  const memory: Memory = { initial: 1 };
  let heapPointer: i32 = 0;
  export function malloc(size: i32): i32 {
    const ptr: i32 = heapPointer;
    heapPointer += size;
    return ptr;
  }

  export function free(ptr: i32) {
  }

  // Getters
  export function geti32(ptr: i32): i32 {
    const view: i32[] = ptr;
    return view[0];
  }

  export function getf32(ptr: i32): f32 {
    const view: f32[] = ptr;
    return view[0];
  }

  export function geti64(ptr: i32): i64 {
    const view: i64[] = ptr;
    return view[0];
  }

  export function getf64(ptr: i32): f64 {
    const view: f64[] = ptr;
    return view[0];
  }

  // Setters
  export function seti32(ptr: i32, value: i32) {
    const view: i32[] = ptr;
    view[0] = value;
  }

  export function setf32(ptr: i32, value: f32) {
    const view: f32[] = ptr;
    view[0] = value;
  }

  export function seti64(ptr: i32, value: i64) {
    const view: i64[] = ptr;
    view[0] = value;
  }

  export function setf64(ptr: i32, value: f64) {
    const view: f64[] = ptr;
    view[0] = value;
  }
`;

export const mapToImports = (plugin: WebAssemblyModuleType) => {
  const {
    malloc,
    free,
    geti32,
    getf32,
    geti64,
    getf64,
    seti32,
    setf32,
    seti64,
    setf64,
  } = plugin.instance.exports;

  return {
    [CLOSURE_MALLOC]: malloc,
    [CLOSURE_FREE]: free,
    [`${CLOSURE_GET}-i32`]: geti32,
    [`${CLOSURE_GET}-f32`]: getf32,
    [`${CLOSURE_GET}-i64`]: geti64,
    [`${CLOSURE_GET}-f64`]: getf64,
    [`${CLOSURE_SET}-i32`]: seti32,
    [`${CLOSURE_SET}-f32`]: setf32,
    [`${CLOSURE_SET}-i64`]: seti64,
    [`${CLOSURE_SET}-f64`]: setf64,
  };
};

export default function closurePlugin() {
  return compile(source, {
    encodeNames: false,
    filename: "walt-closure-plugin",
    lines: source.split("\n"),
  });
}
