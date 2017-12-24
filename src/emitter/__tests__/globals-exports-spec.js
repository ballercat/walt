import test from "ava";
import { I32, F32 } from "../value_type";
import { EXTERN_GLOBAL } from "../external_kind";
import emit from "..";

// TODO:
// the only way we can test output of globals is by exporting them
// should build in some assert() into the binary :)
const init = 42;
const ast = {
  Exports: [{ kind: EXTERN_GLOBAL, field: "meaningOfLife", index: 0 }],
  Globals: [{ mutable: 0, type: I32, init }],
};

test("compiles globals accurately, i32", t => {
  const stream = emit(ast);
  return WebAssembly.instantiate(stream.buffer()).then(
    ({ module, instance }) => {
      t.is(instance instanceof WebAssembly.Instance, true);
      t.is(module instanceof WebAssembly.Module, true);
    }
  );
});

test("compiles globals accurately, f32", t => {
  const stream = emit({
    ...ast,
    Globals: [{ mutable: 0, type: F32, init }],
  });
  return WebAssembly.instantiate(stream.buffer()).then(
    ({ module, instance }) => {
      t.is(instance instanceof WebAssembly.Instance, true);
      t.is(module instanceof WebAssembly.Module, true);
    }
  );
});

test("encodes correct values", t => {
  const stream = emit(ast);
  return WebAssembly.instantiate(stream.buffer()).then(
    ({ module, instance }) => {
      t.is(instance instanceof WebAssembly.Instance, true);
      t.is(module instanceof WebAssembly.Module, true);
      t.is(instance.exports.meaningOfLife, init);
    }
  );
});
