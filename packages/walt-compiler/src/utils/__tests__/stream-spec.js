import test from "ava";
import Stream, { stream as makeStream } from "../stream";
import { performance } from "perf_hooks";

test("stream", t => {
  const stream = new Stream("ab" + "\n" + "12");
  t.is(stream.next(), "a", "next");
  t.is(stream.peek(), "b", "peek");
  // some timing comparison for the heck of it
  const start = performance.now();
  stream.next();
  stream.next();
  console.log("JS TIME", performance.now() - start);
  t.is(stream.col, 0, "column");
  t.is(stream.line, 2, "line");
  t.is(stream.peek(), "1", "peek after newline");
});

test.only("walt stream", t => {
  return makeStream("ab" + "\n" + "12").then(stream => {
    t.is(stream.next(), "a", "next");
    t.is(stream.peek(), "b", "peek");
    const start = performance.now();
    stream.next();
    stream.next();
    console.log("WASM TIME", performance.now() - start);
    t.is(stream.col, 0, "column");
    t.is(stream.line, 2, "line");
    t.is(stream.peek(), "1", "peek after newline");
  });
});
