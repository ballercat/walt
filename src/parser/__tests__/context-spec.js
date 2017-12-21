import Context from "../context";

const ctx = new Context({
  token: {
    start: { line: 1, col: 13 },
    end: { line: 1, col: 30 }
  },
  lines: ["let x: i32 = someUnknownToken;"],
  filename: "test.walt",
  func: { id: "test" }
});

test("syntaxError generates an accurate error string", () => {
  const syntaxError = ctx.syntaxError("Test Error", "unknown token");
  expect(syntaxError instanceof SyntaxError).toBe(true);
  expect(syntaxError.toString()).toMatchSnapshot();
});

test("unknown token generates syntax error", () => {
  const syntaxError = ctx.unknown(ctx.token);
  expect(syntaxError instanceof SyntaxError).toBe(true);
  expect(syntaxError.toString()).toMatchSnapshot();
});

test("unexpected generates syntax error", () => {
  const syntaxError = ctx.unexpected(ctx.token.value);
  expect(syntaxError instanceof SyntaxError).toBe(true);
  expect(syntaxError.toString()).toMatchSnapshot();
});
