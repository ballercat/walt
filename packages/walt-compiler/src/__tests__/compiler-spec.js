import test from "ava";
import compile from "..";
import path from "path";
import { harness } from "../utils/test-utils";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src, { encodeNames: true }), imports);

test("empty module compilation", t =>
  compileAndRun("").then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  }));

test("invalid imports throw", t =>
  t.throws(() => compile("import foo from 'bar'")));

test(
  "compiler",
  harness(path.resolve(__dirname, "./compiler-spec.walt"), {
    externalConst: 42,
  })
);
