import opcode from './opcode';
import { u32 } from 'wasm-types';
import invariant from 'invariant';

// TODO these should be configure-able/not defined here
export const VERSION = 0x1;
export const MAGIC = 0x6d736100;
export const MAGIC_INDEX = 0;
export const VERSION_INDEX = 4;

export default function write(
  stream
) {
  invariant(
    !(stream instanceof DataView),
    `Stream must be incanse of DataView, received ${typeof DataView}`
  );

  stream.set(u32, 0, MAGIC);
  stream.set(u32, 4, VERSION);
}
