import test from "ava";
import { u32, get } from "wasm-types";
import preamble, {
  MAGIC,
  VERSION,
  MAGIC_INDEX,
  VERSION_INDEX
} from "../preamble";

test("preamble writes correct values", t => {
  const view = new DataView(preamble().buffer());
  t.is(get(u32, MAGIC_INDEX, view), MAGIC);
  t.is(get(u32, VERSION_INDEX, view), VERSION);
});
