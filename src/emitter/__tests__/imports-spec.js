import test from "ava";
import { I32 } from "../value_type";
import { EXTERN_GLOBAL } from "../external_kind";
import emit from "..";

const ast = {
  Imports: [
    {
      module: "a",
      field: "b",
      kind: EXTERN_GLOBAL,
      global: I32,
    },
    {
      module: "foo",
      field: "bar",
      kind: EXTERN_GLOBAL,
      global: I32,
    },
  ],
};

test("compiles imports accurately", t => {
  const stream = emit(ast);
  return WebAssembly.instantiate(
    stream.buffer(), { a: { b: 42 }, foo: { bar: 0xFFFFF } }
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  });
});
