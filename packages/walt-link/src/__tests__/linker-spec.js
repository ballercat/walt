const test = require("ava");
const { link } = require("..");
const path = require("path");
const fs = require("fs");

test("returns (src: string) => (importsObj) => Promise<Wasm>", async t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const factory = link(path.resolve(__dirname, "./index.walt"));
  t.is(typeof factory === "function", true, "linker returns a factory");
  const wasm = await factory({
    env: { memory },
  });
  t.is(typeof wasm.instance.exports.run === "function", true);
  t.is(wasm.instance.exports.run(), 62);

  return wasm;
});
