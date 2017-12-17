import Tokenizer from "..";
import Stream from "../../utils/stream";
import Syntax from "../../Syntax";
import test from "ava";

test("next reads tokens, ignoring whitespace", t => {
  const tokenizer = new Tokenizer(new Stream("     global"));
  t.deepEqual(tokenizer.next(), {
    type: Syntax.Keyword,
    value: "global",
    end: {
      col: 11,
      line: 1,
    },
    start: {
      col: 5,
      line: 1,
    },
  });
});

test("parses a stream into tokens", t => {
  const stream = new Stream("let x: i32 = 2;");
  const tokenizer = new Tokenizer(stream);
  const result = tokenizer.parse();
  t.snapshot(result);
});

test("ignores whitespace at the end of file", t => {
  const stream = new Stream(`
  function test(): i32 {
    return 2 + 2;
  }
  `);
  const tokenizer = new Tokenizer(stream);
  const result = tokenizer.parse();
  t.snapshot(result);
});

test("ignores comments", t => {
  const stream = new Stream(`
  // comment
  2`);
  const tokenizer = new Tokenizer(stream);
  const result = tokenizer.parse();
  t.snapshot(result);
});

test("parses basic strings", t => {
  const stream = new Stream("'this is a string' \"and so is this\"");
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});

test("parsers strings within strings", t => {
  const stream = new Stream("\"here is a string with a 'substring'\"");
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});
