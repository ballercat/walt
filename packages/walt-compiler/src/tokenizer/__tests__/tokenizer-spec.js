import Tokenizer from "..";
import compile from "../../";
import Stream from "../../utils/stream";
import Syntax from "../../Syntax";
import test from "ava";

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("next reads tokens, ignoring whitespace", t => {
  const tokenizer = new Tokenizer(new Stream("     global"));
  t.deepEqual(tokenizer.next(), {
    type: Syntax.Keyword,
    value: "global",
    end: {
      sourceLine: "     global",
      col: 11,
      line: 1,
    },
    start: {
      sourceLine: "     global",
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

test("ignores multiline comments", t => {
  const stream = new Stream(`
    /* multiline
     *  comment
     * */
    2 * 2`);
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});

test("ignores one-liner multiline comments", t => {
  const stream = new Stream(`
    /* comment  */
    2`);
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});

test("ignores singleline tokens within multiline and vice-versa", t => {
  const stream = new Stream(`
    /* // multiline comment */
    // /* */ 4 single line
  `);
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});

test("ignores multiline comments and compiles correctly", t => {
  const content = `
    /* comment  */
    export function test() {
      return 2/* inline comment */ * 2;
    }`;

  const stream = new Stream(content);
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());

  compileAndRun(content).then(outputIs(t, 4));
});

test("parses basic strings", t => {
  const stream = new Stream("'this is a string' \"and so is this\"");
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});

test("parses strings within strings", t => {
  const stream = new Stream("\"here is a string with a 'substring'\"");
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});

test("parses strings with escaped string", t => {
  // eslint-disable-next-line
  const stream = new Stream(`"string start \\" string end" 'start \\' end '`);
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});

test("parses identifiers with numbers", t => {
  const stream = new Stream("test1foo42bar ");
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse());
});

test("number literals", t => {
  const stream = new Stream("1e10 0b101 0xFF 0B0101 0o10 0b10 0xff 0xE10");
  const tokenizer = new Tokenizer(stream);
  t.snapshot(tokenizer.parse().map(({ value }) => value));
});
