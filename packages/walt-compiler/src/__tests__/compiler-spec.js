import test from "ava";
import compile, { UNSTABLE_asyncCompile } from "..";
import { getText } from "../utils/string";
import { readFileSync } from "fs";
import path from "path";
import waltSource from "./compiler-spec.walt";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src, { encodeNames: true }), imports);

test("empty module compilation", t =>
  compileAndRun("").then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  }));

test("invalid imports throw", t =>
  t.throws(() => compile("import foo from 'bar'")));
