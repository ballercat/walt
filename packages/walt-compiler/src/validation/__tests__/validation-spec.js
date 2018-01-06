import test from "ava";
import parser from "../../parser";
import semantics from "../../semantics";
import validate from "..";

const parseAndValidate = source =>
  validate(semantics(parser(source)), {
    lines: source.split("/n"),
    filename: "spec.walt",
  });

test("typos throw", t => {
  const error = t.throws(() => parseAndValidate("expost const x: i32;"));
  t.snapshot(error);
});
test("const exports must have value", t => {
  const error = t.throws(() => parseAndValidate("export const x: i32;"));
  t.snapshot(error);
});
