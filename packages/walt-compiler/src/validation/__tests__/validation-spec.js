import test from "ava";
import parser from "../../parser";
import semantics from "../../semantics";
import validate from "..";

const parseAndValidate = source =>
  validate(semantics(parser(source)), source.split("/n"), "spec.walt");

test("typos throw", t =>
  t.throws(() => parseAndValidate("expost const x: i32;")));
test("const exports must have value", t =>
  t.throws(() => parseAndValidate("export const x: i32;")));
