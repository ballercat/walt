import test from "ava";
import sizeofParser from "../sizeof";
import statement from "../statement";
import { TYPE_USER, OBJECT_SIZE } from "../../parser/metadata";
import { mockContext } from "../../utils/mocks";

test("sizeof parser, built-in type", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ value: "x", type: "i32", meta: [], params: [] }];
  const node = sizeofParser(ctx);

  t.is(node.value, "4");
  t.is(node.type, "i32");
});

test("sizeof parser, arrays throw", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [
    { value: "x", type: "i32", meta: [{ type: "type/array" }], params: [] },
  ];

  t.throws(() => sizeofParser(ctx));
});

test("sizeof parser, user-defined object types", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [
    {
      value: "x",
      type: "i32",
      params: [],
      meta: [
        {
          type: TYPE_USER,
          payload: { params: [], meta: [{ type: OBJECT_SIZE, payload: 16 }] },
        },
      ],
    },
  ];
  const node = sizeofParser(ctx);
  t.is(node.value, 16);
});

test("sizeof parser, 64 bit variables", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ value: "x", type: "f64", meta: [], params: [] }];
  const node = sizeofParser(ctx);
  t.snapshot(node);
});

test("statements as sizeof calls", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ value: "x", type: "f64", meta: [], params: [] }];
  const node = statement(ctx);
  t.snapshot(node);
});
