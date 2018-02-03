import Syntax from "../../Syntax";
import test from "ava";
import Context from "../context";

const ctx = new Context({
  token: {
    type: Syntax.Identifier,
    value: "someUnknownToken",
    start: { sourceLine: "let x: i32 = someUnknownToken;", line: 1, col: 13 },
    end: { sourceLine: "let x: i32 = someUnknownToken;", line: 1, col: 30 },
  },
  filename: "test.walt",
  func: "test",
});

test("syntaxError generates an accurate error string", t => {
  const syntaxError = ctx.syntaxError("Test Error", "unknown token");
  t.is(syntaxError instanceof SyntaxError, true);
  t.snapshot(syntaxError.toString());
});

test("unknown token generates syntax error", t => {
  const syntaxError = ctx.unknown(ctx.token);
  t.is(syntaxError instanceof SyntaxError, true);
  t.snapshot(syntaxError.toString());
});

test("unexpected generates syntax error", t => {
  const syntaxError = ctx.unexpected(ctx.token.value);
  t.is(syntaxError instanceof SyntaxError, true);
  t.snapshot(syntaxError.toString());
});

test("unsupported generates a syntax error", t => {
  const unsupportedError = ctx.unsupported();
  t.is(unsupportedError instanceof SyntaxError, true);
});

test("unexpecteValue generates a syntax error", t => {
  const unexpectedValue = ctx.unexpectedValue("foobar");
  t.is(unexpectedValue instanceof SyntaxError, true);
});

test("eat returns false if not token specified", t => {
  t.is(ctx.eat(null, Syntax.Keyword), false);
});

test("expect will throw on a non-expected token", t => {
  t.throws(() => ctx.expect(null, Syntax.Keyword));
});
