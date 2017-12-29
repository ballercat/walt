import test from "ava";
import compile from "..";
import statement from "../parser/statement";
import parseFunction from "../parser/maybe-function-declaration";
import { TYPE_ARRAY, LOCAL_INDEX_MAP } from "../parser/metadata";
import { mockContext } from "../utils/mocks";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("memory parser", t => {
  const ctx = mockContext(`function test(): i32 {
    let x: i32[] = 0;
    let y: i32 = 5;
    x[0] = 21;
    x[y] = 2;
    return x[0] * x[y];
  }`);
  const node = parseFunction(ctx);
  t.snapshot(node);
});

test("memory can be defined", t =>
  compileAndRun(
    `
  const memory: Memory = { 'initial': 2 };

  export function test(): i32 {
    let x: i32[] = 0;
    let y: i32 = 5;
    x[0] = 21;
    x[y] = 2;
    return x[0] * x[y];
  }`
  ).then(outputIs(t, 42)));

test("memory can be imported", t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const view = new Int32Array(memory.buffer);
  view[1024] = 42;
  return compileAndRun(
    `
  import { memory: Memory } from 'env';
  export function test(): i32 {
    const pointer: i32[] = 0;
    return pointer[1024];
  }
  `,
    { env: { memory } }
  ).then(outputIs(t, 42));
});

test("memory max can be set", () =>
  compileAndRun("const memory: Memory = { 'initial': 1, 'max': 2 };"));

test("memory store on float arrays", t => {
  const ctx = mockContext("x[0] = 2.0;");
  ctx.func = {
    params: [],
    meta: [
      {
        type: LOCAL_INDEX_MAP,
        payload: {
          x: {
            node: {
              value: "x",
              type: "i32",
              meta: [{ type: TYPE_ARRAY, payload: "f32" }],
              params: [],
            },
          },
        },
      },
    ],
  };
  const node = statement(ctx);
  t.snapshot(node);
});
