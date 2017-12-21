import Tokenizer from "..";
import Stream from "../../utils/stream";
import Syntax from "../../Syntax";

test("next reads tokens, ignoring whitespace", () => {
  const tokenizer = new Tokenizer(new Stream("     global"));
  expect(tokenizer.next()).toEqual({
    type: Syntax.Keyword,
    value: "global",
    end: {
      col: 11,
      line: 1
    },
    start: {
      col: 5,
      line: 1
    }
  });
});

test("parses a stream into tokens", () => {
  const stream = new Stream(`let x: i32 = 2;`);
  const tokenizer = new Tokenizer(stream);
  const result = tokenizer.parse();
  expect(result).toMatchSnapshot();
});

test("ignores whitespace at the end of file", () => {
  const stream = new Stream(`
  function test(): i32 {
    return 2 + 2;
  }
  `);
  const tokenizer = new Tokenizer(stream);
  const result = tokenizer.parse();
  expect(result).toMatchSnapshot();
});

test("ignores comments", () => {
  const stream = new Stream(`
  // comment
  2`);
  const tokenizer = new Tokenizer(stream);
  const result = tokenizer.parse();
  expect(result).toMatchSnapshot();
});

test("parses basic strings", () => {
  const stream = new Stream(`'this is a string' "and so is this"`);
  const tokenizer = new Tokenizer(stream);
  expect(tokenizer.parse()).toMatchSnapshot();
});

test("parsers strings within strings", () => {
  const stream = new Stream(`"here is a string with a 'substring'"`);
  const tokenizer = new Tokenizer(stream);
  expect(tokenizer.parse()).toMatchSnapshot();
});
