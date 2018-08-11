// @flow
import { parser } from '..';
import type { NodeType } from '../flow/types';

export const CLOSURE_FREE = '__closure_free';
export const CLOSURE_MALLOC = '__closure_malloc';
export const CLOSURE_BASE = '__closure_base';
export const CLOSURE_ENV_PTR = '__env_ptr';
export const CLOSURE_GET = '__closure_get';
export const CLOSURE_SET = '__closure_set';

export default function imports(): NodeType[] {
  return parser(`
    import {
      '${CLOSURE_MALLOC}': ClosureGeti32,
      '${CLOSURE_FREE}': ClosureFree,
      '${CLOSURE_GET}_i32': ClosureGeti32,
      '${CLOSURE_GET}_f32': ClosureGetf32,
      '${CLOSURE_GET}_i64': ClosureGeti64,
      '${CLOSURE_GET}_f64': ClosureGetf64,
      '${CLOSURE_SET}_i32': ClosureSeti32,
      '${CLOSURE_SET}_f32': ClosureSetf32,
      '${CLOSURE_SET}_i64': ClosureSeti64,
      '${CLOSURE_SET}_f64': ClosureSetf64
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
