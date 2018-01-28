// @flow
import compile from "..";
import type { WebAssemblyModuleType } from "../flow/types";

// Make this a .walt file or pre-parse into an ast.
const source = `
  const memory: Memory = { initial: 1 };
  let heapPointer: i32 = 0;
  export function make(size: i32): i32 {
    const ptr: i32 = heapPointer;
    heapPointer += 8;
    return ptr;
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
    make,
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
    "closure--get": make,
    "closure--get-i32": geti32,
    "closure--get-f32": getf32,
    "closure--get-i64": geti64,
    "closure--get-f64": getf64,
    "closure--set-i32": seti32,
    "closure--set-f32": setf32,
    "closure--set-i64": seti64,
    "closure--set-f64": setf64,
  };
};

export default function closurePlugin() {
  return compile(source);
}
