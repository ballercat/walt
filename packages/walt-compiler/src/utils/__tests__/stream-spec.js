import test from "ava";
import Stream from "../stream";

test("stream", t => {
  const stream = new Stream("abcdefg 1234567890");
  t.is(stream.next(), "a", "next");
  t.is(stream.peek(), "b", "peek");
  t.is(stream.col, 1, "column");
  t.is(stream.line, 1, "line");
});
