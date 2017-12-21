import sizeofParser from "../sizeof";
import { TYPE_USER, OBJECT_SIZE } from "../../parser/metadata";
import { mockContext } from "../../utils/mocks";
//import printNode from "../../utils/print-node";

test("sizeof parser, built-in type", () => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ id: "x", type: "i32", meta: [] }];
  const node = sizeofParser(ctx);

  expect(node.value).toBe("4");
  expect(node.type).toBe("i32");
});

test("sizeof parser, arrays throw", () => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ id: "x", type: "i32", meta: [{ type: "type/array" }] }];

  expect(() => sizeofParser(ctx)).toThrow();
});

test("sizeof parser, user-defined object types", () => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [
    {
      id: "x",
      type: "i32",
      meta: [
        {
          type: TYPE_USER,
          payload: { meta: [{ type: OBJECT_SIZE, payload: 16 }] }
        }
      ]
    }
  ];
  const node = sizeofParser(ctx);
  expect(node.value).toBe(16);
});

test("sizeof parser, 64 bit variables", () => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [{ id: "x", type: "f64", meta: [] }];
  const node = sizeofParser(ctx);
  expect(node).toMatchSnapshot();
});
