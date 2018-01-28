// @flow
import { parser } from "..";
import type { NodeType } from "../flow/types";

export default function imports(): NodeType[] {
  return parser(`
    import {
      'closure--get': ClosureGeti32,
      'closure--get-i32': ClosureGeti32,
      'closure--get-f32': ClosureGetf32,
      'closure--get-i64': ClosureGeti64,
      'closure--get-f64': ClosureGetf64,
      'closure--set-i32': ClosureSeti32,
      'closure--set-f32': ClosureSetf32,
      'closure--set-i64': ClosureSeti64,
      'closure--set-f64': ClosureSetf64
    } from 'walt-plugin-closure';
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
