// @flow
import { parser } from "..";
import {
  CLOSURE_SET,
  CLOSURE_GET,
  CLOSURE_FREE,
  CLOSURE_MALLOC,
} from "../semantics/closure";
import type { NodeType } from "../flow/types";

export default function imports(): NodeType[] {
  return parser(`
    import {
      '${CLOSURE_MALLOC}': ClosureGeti32,
      '${CLOSURE_FREE}': ClosureFree,
      '${CLOSURE_GET}-i32': ClosureGeti32,
      '${CLOSURE_GET}-f32': ClosureGetf32,
      '${CLOSURE_GET}-i64': ClosureGeti64,
      '${CLOSURE_GET}-f64': ClosureGetf64,
      '${CLOSURE_SET}-i32': ClosureSeti32,
      '${CLOSURE_SET}-f32': ClosureSetf32,
      '${CLOSURE_SET}-i64': ClosureSeti64,
      '${CLOSURE_SET}-f64': ClosureSetf64
    } from 'walt-plugin-closure';
    type ClosureFree = (i32) => void;
    type ClosureGeti32 = (i32) => i32;
    type ClosureGetf32 = (i32) => f32;
    type ClosureGeti64 = (i32) => i64;
    type ClosureGetf64 = (i32) => f64;
    type ClosureSeti32 = (i32, i32) => void;
    type ClosureSetf32 = (i32, f32) => void;
    type ClosureSeti64 = (i32, i64) => void;
    type ClosureSetf64 = (i32, f64) => void;
  `).params;
}
