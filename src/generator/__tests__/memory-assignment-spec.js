import test from "ava";
import parseStatement from "../../parser/statement";
import mapSyntax from "../map-syntax";
import {
  TYPE_ARRAY,
  TYPE_USER,
  TYPE_OBJECT,
  OBJECT_KEY_TYPES
} from "../../parser/metadata";
import { mockContext } from "../../utils/mocks";
import printNode from "../../utils/print-node";

test("unary negation, arrays", t => {
  const ctx = mockContext("x[0] = ((x * 7 % 200) - 100) / 100.0");
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "i32" }] }
    ]
  };
  t.snapshot(parseStatement(ctx));
});

test("generates correct offsets for arrays", t => {
  const ctx = mockContext(`x[1] = 42;`);
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "i32" }] }
    ]
  };
  const node = parseStatement(ctx);
  const ir = mapSyntax(null, node);
  t.snapshot(ir);
});

test("generates correct offsets for user-defined objects", t => {
  const ctx = mockContext(`x['bar'] = 42;`);
  ctx.func = {
    locals: [
      {
        id: "x",
        type: "i32",
        // Metadata for TYPE_USER payload is a REFERENCE to a type-node which
        // itself contains metadata for byte offsets map, referenced by TYPE_OBJECT
        meta: [
          {
            type: TYPE_USER,
            payload: {
              meta: [
                { type: TYPE_OBJECT, payload: { foo: 0, bar: 4 } },
                { type: OBJECT_KEY_TYPES, payload: { foo: "i32", bar: "i32" } }
              ]
            }
          }
        ]
      }
    ]
  };
  const node = parseStatement(ctx);
  const ir = mapSyntax(null, node);
  t.snapshot(ir);
});
