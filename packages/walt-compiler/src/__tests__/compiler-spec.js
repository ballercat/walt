import test from "ava";
import parse from "../parser";
import validate from "../validation";
import semantics from "../semantics";
import compile from "..";
import print from "walt-buildtools/print";
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

test("import as", t => {
  const node = semantics(
    parse(`
import {
  getStringIterator,
  next as string_next,
  reset,
  stringLength,
  indexOf
} from '../walt/string';
`)
  );
  const error = t.throws(() => validate(node, {}));
  t.snapshot(print(node));
  t.snapshot(error.message);
});

test("bool types", t => {
  const source = `
    const b : bool = false;
    function foo() : bool {
      return true;
    }

    function bar(): bool {
      return false;
    }

    export function test() : bool {
      return bar() || foo();
    }
  `;
  return compileAndRun(source).then(({ instance }) => {
    t.is(instance.exports.test(), 1);
  });
});
