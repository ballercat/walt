import test from "ava";
import { compile } from "walt-compiler";
import fs from "fs";
import path from "path";
import compileFromFile from "../compile-from-file";
import write from "../write";

test("read & write", t => {
  const source = `
import { memory: Memory, log: Logger } from 'env';

// Types
type Parser = {
  current: i32,
  pos: i32,
  start: i32,
  length: i32
};
type Logger = (i32) => void;


// Memory
let memoryOffset: i32 = 0;
let view: i32[] = 0;

// Constants
const HEADER: i32 = 0x00;
const H1_OPEN: i32[] = ['<', 'h', '1', '>'];
const H1_CLOSE: i32[] = ['<', '/', 'h', '1', '>'];
const UL_OPEN: i32[] = ['<', 'u', 'l', '>'];
const UL_CLOSE: i32[] = ['<', '/', 'u', 'l', '>'];
const LI_OPEN: i32[] = ['<', 'l', 'i', '>'];
const LI_CLOSE: i32[] = ['<', '/', 'l', 'i', '>'];

export function run(): i32 {
  return 42;
}
  `;

  return compileFromFile(path.resolve(__dirname, "test.walt"), compile, {
    readFile(_, __, cb) {
      cb(null, source);
    }
  })
    .then(wasm => {
      const view = new Uint8Array(wasm.buffer());
      return write(view, "/tmp/test-walt-result.wasm", fs);
    })
    .catch(err => console.log("write failed", err))
    .then(() => {
      const b = fs.readFileSync("/tmp/test-walt-result.wasm");

      const memory = new WebAssembly.Memory({ initial: 1 });
      const { log } = console;
      return WebAssembly.instantiate(b, { env: { memory, log } }).then(mod => {
        t.is(mod.instance.exports.run(), 42);
      });
    });
});
