import { u8 } from 'wasm-types';

export const FUNCTION = 0;
export const TABLE = 1;
export const MEMORY = 2;
export const _GLOBAL = 3;

export default function externalKind(value) {
  // single byte integer indicating the kind of definition imported or defined
  return { type: u8, value };
};
