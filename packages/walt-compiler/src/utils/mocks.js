// @flow
import Context from "../parser/context";
import TokenStream from "../utils/token-stream";
import Tokenizer from "../tokenizer";
import Stream from "./stream";
import { LOCAL_INDEX_MAP } from "../metadata/metadata";

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
export const mockFunction = (ctx: Context, options: any): Context => {
  const meta = [];
  let type = "i32";
  if (options.locals) {
    meta.push({
      type: LOCAL_INDEX_MAP,
      payload: options.locals.reduce((a, v, i) => {
        a[v.value] = {
          index: i,
          node: v,
        };
        return a;
      }, {}),
    });
  }
  const functionNode = {
    meta,
    value: "undefined",
    Type: "Function",
    type,
    params: [],
    range: [],
    ...options,
  };
  ctx.func = functionNode;
  ctx.functions.push(functionNode);

  return ctx;
};
