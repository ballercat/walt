import { u32 } from "wasm-types";
import OutputStream from "../utils/output-stream";

// TODO these should be configure-able/not defined here
export const VERSION = 0x1;
export const MAGIC = 0x6d736100;
export const MAGIC_INDEX = 0;
export const VERSION_INDEX = 4;

export default function write() {
  return new OutputStream()
    .push(u32, MAGIC, `\\0asm`)
    .push(u32, VERSION, `version ${VERSION}`);
}
