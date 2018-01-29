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

test.only("undefined types throw", t => {
  // Memory and Tables are fine
  parseAndValidate("import { memory: Memory, table: Table } from 'env';");
  const error = t.throws(() =>
    parseAndValidate("import { foo: Type } from 'env';")
  );
  t.snapshot(error);
});
