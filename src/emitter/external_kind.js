import { u8 } from 'wasm-types';

export const EXTERN_FUNCTION = 0;
export const EXTERN_TABLE = 1;
export const EXTERN_MEMORY = 2;
export const EXTERN_GLOBAL = 3;

export default function externalKind(value) {
  // single byte integer indicating the kind of definition imported or defined
  return { type: u8, value };
};
