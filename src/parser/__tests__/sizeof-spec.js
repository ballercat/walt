import test from "ava";
import sizeofParser from "../sizeof";
import { TYPE_USER, OBJECT_SIZE } from "../../parser/metadata";
import { mockContext } from "../../utils/mocks";
// import printNode from "../../utils/print-node";

test("sizeof parser, built-in type", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ id: "x", type: "i32", meta: [] }];
  const node = sizeofParser(ctx);

  t.is(node.value, "4");
  t.is(node.type, "i32");
});

test("sizeof parser, arrays throw", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ id: "x", type: "i32", meta: [{ type: "type/array" }] }];

  t.throws(() => sizeofParser(ctx));
});

test("sizeof parser, user-defined object types", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [
    {
      id: "x",
      type: "i32",
      meta: [
        {
          type: TYPE_USER,
          payload: { meta: [{ type: OBJECT_SIZE, payload: 16 }] },
        },
      ],
    },
  ];
  const node = sizeofParser(ctx);
  t.is(node.value, 16);
});

test("sizeof parser, 64 bit variables", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ id: "x", type: "f64", meta: [] }];
  const node = sizeofParser(ctx);
  t.snapshot(node);
});
