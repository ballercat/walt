const test = require("ava");
const {
  getFullSyntaxTree,
  buildBinaries,
  mergeStatics,
  compile,
  link,
  parseImports,
  parseIntoAST,
} = require("..");
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

test("parse imports", t => {
  const src = fs.readFileSync(path.resolve(__dirname, "./index.walt"), "utf8");
  const imports = parseImports(parseIntoAST(src));
  t.snapshot(imports);
});

test("getFullSyntaxTree", t => {
  const filepath = path.resolve(__dirname, "./index.walt");
  const filename = filepath.split("/").pop();
  const src = fs.readFileSync(filepath, "utf8");
  const options = {
    version: 0x1,
    filename,
    filepath,
    lines: src.split("/n"),
    src,
  };
  const resolve = file => {
    return path.resolve(path.dirname(filepath), file);
  };

  const asts = getFullSyntaxTree(options, resolve);
  t.snapshot(asts);
});

test("merge Statics", t => {
  const filepath = path.resolve(__dirname, "./index.walt");
  const filename = filepath.split("/").pop();
  const src = fs.readFileSync(filepath, "utf8");
  const options = {
    version: 0x1,
    filename,
    filepath,
    lines: src.split("/n"),
    src,
  };
  const resolve = file => {
    return path.resolve(path.dirname(filepath), file);
  };

  const asts = getFullSyntaxTree(options, resolve);

  const statics = mergeStatics(asts);
  t.snapshot(statics);
});

test.only("build binaries", t => {
  const filepath = path.resolve(__dirname, "./index.walt");
  const filename = filepath.split("/").pop();
  const src = fs.readFileSync(filepath, "utf8");
  const options = {
    version: 0x1,
    filename,
    filepath,
    lines: src.split("/n"),
    src,
  };
  const resolve = file => {
    return path.resolve(path.dirname(filepath), file);
  };

  const asts = getFullSyntaxTree(options, resolve);
  const statics = mergeStatics(asts);
  const binaries = buildBinaries(asts, { ...options, linker: { statics } });

  t.snapshot(binaries);
});
