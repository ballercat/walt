import test from "ava";
import { async as asyncStream } from "../stream";

test("walt stream", t => {
  return asyncStream("ab" + "\n" + "12").then(stream => {
    t.is(stream.next(), "a", "next");
    t.is(stream.peek(), "b", "peek");
    stream.next();
    stream.next();
    t.is(stream.col, 0, "column");
    t.is(stream.line, 2, "line");
    t.is(stream.peek(), "1", "peek after newline");
  });
});
