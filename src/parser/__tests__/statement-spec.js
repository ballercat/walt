import test from "ava";
import statement from "../statement";
import { mockContext } from "../../utils/mocks";

test("not yet implemented keywords throw", t => {
  const ctx = mockContext("table");
  t.throws(() => statement(ctx));
});

test("expressions where a statment should be, throw", t =>
  t.throws(() => statement(mockContext("="))));

test("unsupported keywords throw", t =>
  t.throws(() => statement(mockContext("assert"))));
