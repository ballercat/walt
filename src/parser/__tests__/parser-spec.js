import Parser from "..";
import Tokenizer from "../../tokenizer";
import TokenStream from "../../utils/token-stream";
import Stream from "../../utils/stream";

const prepare = string =>
  new TokenStream(new Tokenizer(new Stream(string)).parse());

test("the most basic of modules in wasm", () => {
  const result = new Parser(prepare("")).parse();
  // Empty ast, empty module
  expect(result).toMatchSnapshot();
});

test("compiles globals", () => {
  const result = new Parser(prepare("const answer: i32 = 42;")).parse();
  expect(result).toMatchSnapshot();
});

test("compiles exports", () => {
  const result = new Parser(prepare("export const answer: i32 = 42;")).parse();
  expect(result).toMatchSnapshot();
});
