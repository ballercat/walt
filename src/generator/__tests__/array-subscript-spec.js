import test from "ava";
import parseExpression from "../../parser/expression";
import generateArraySubscript from "../array-subscript";
import { TYPE_ARRAY, TYPE_USER, TYPE_OBJECT } from "../../parser/metadata";
import { mockContext } from "../../utils/mocks";

test("generated array offsets", t => {
  const ctx = mockContext(`x[1];`);
  ctx.func = {
    locals: [{ id: "x", type: "i32", meta: [{ type: TYPE_ARRAY }] }]
  };
  const node = parseExpression(ctx);
  const ir = generateArraySubscript(node);
  t.snapshot(ir);
});

test("doesn not work on undefined variables", t => {
  const ctx = mockContext(`x[1]`);
  t.throws(() => parseExpression(ctx));
});

test("generates correct offsets for user-defined objects", t => {
  const ctx = mockContext(`x['bar'];`);
  ctx.func = {
    locals: [
      {
        id: "x",
        type: "i32",
        meta: [
          {
            type: TYPE_USER,
            payload: {
              meta: [{ type: TYPE_OBJECT, payload: { foo: 0, bar: 4 } }]
            }
          }
        ]
      }
    ]
  };
  const node = parseExpression(ctx);
  const ir = generateArraySubscript(node);
  t.snapshot(ir);
});
