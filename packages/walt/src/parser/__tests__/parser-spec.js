import test from "ava";
import Parser from "..";
import Tokenizer from "../../tokenizer";
import TokenStream from "../../utils/token-stream";
import Stream from "../../utils/stream";

const prepare = string =>
  new TokenStream(new Tokenizer(new Stream(string)).parse());

test("the most basic of modules in wasm", t => {
  const result = new Parser(prepare("")).parse();
  // Empty ast, empty module
  t.snapshot(result);
});

test("compiles globals", t => {
  const result = new Parser(prepare("const answer: i32 = 42;")).parse();
  t.snapshot(result);
});

test("compiles exports", t => {
  const result = new Parser(prepare("export const answer: i32 = 42;")).parse();
  t.snapshot(result);
});
