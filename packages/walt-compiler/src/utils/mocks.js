// @flow
import Context from "../parser/context";
import TokenStream from "../utils/token-stream";
import Tokenizer from "../tokenizer";
import Stream from "./stream";

export const mockContext = (code: string): Context => {
  const stream = new Stream(code);
  const tokens = new TokenStream(new Tokenizer(stream).parse());

  return new Context({
    body: [],
    diAssoc: "right",
    stream: tokens,
    token: tokens.next(),
    lines: stream.lines,
    globals: [],
    functions: [],
    filename: "mockContext.walt",
  });
};
