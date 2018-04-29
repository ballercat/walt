const test = require("ava");
const { link, parseImports, parseIntoAST } = require("..");
const path = require("path");
const fs = require("fs");
const { stringDecoder } = require("walt-compiler");

test("returns (src: string) => (importsObj) => Promise<Wasm>", async t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const factory = link(path.resolve(__dirname, "./index.walt"));
  t.is(typeof factory === "function", true, "linker returns a factory");
  const wasm = await factory({
    env: { memory },
  });
  t.is(typeof wasm.instance.exports.run === "function", true);
  t.is(wasm.instance.exports.run(), 62);

  const helloPtr = wasm.instance.exports.helloTest();

  const view = new DataView(memory.buffer);
  const decoder = stringDecoder(view, helloPtr);
  let iterator = decoder.next();
  let text = "";
  while (!iterator.done) {
    text += String.fromCodePoint(iterator.value);
    iterator = decoder.next();
  }

  console.log(text);

  return wasm;
});

test.only("parse imports", t => {
  const src = fs.readFileSync(path.resolve(__dirname, "./index.walt"), "utf8");
  const imports = parseImports(parseIntoAST(src));
  t.snapshot(imports);
});
