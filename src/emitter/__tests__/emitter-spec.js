import test from "ava";
import emit from "../";

test("emitter, emits valid WebAssembly instance", t => {
  const output = emit();
  return WebAssembly.instantiate(
    output.buffer()
  ).then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  });
});
