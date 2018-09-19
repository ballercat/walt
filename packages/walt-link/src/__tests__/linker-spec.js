const test = require("ava");
const link = require("..");
const path = require("path");
const fs = require("fs");
const compiler = require("walt-compiler");

const decodeText = (view, ptr) => {
  const decoder = compiler.stringDecoder(view, ptr);
  let iterator = decoder.next();
  let text = "";
  while (!iterator.done) {
    text += String.fromCodePoint(iterator.value);
    iterator = decoder.next();
  }

  return text;
};

const resolve = (file, parent) => {
  if (parent != null) {
    return path.resolve(
      path.dirname(parent),
      file.slice(-5) === ".walt" ? file : file + ".walt"
    );
  }

  return path.resolve(__dirname, file);
};

const getFileContents = (file, parent, mode) => {
  if (parent != null) {
    return fs.readFileSync(resolve(file, parent), mode);
  }

  return fs.readFileSync(resolve(file, null), mode);
};

test("returns (src: string) => (importsObj) => Promise<Wasm>", async t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const factory = link("./index.walt", null, {
    ...compiler,
    parser: compiler.makeParser([]),
    getFileContents,
    resolve,
  });
  t.is(typeof factory === "function", true, "linker returns a factory");
  const wasm = await factory({
    env: { memory },
  });
  t.is(typeof wasm.instance.exports.run === "function", true);
  t.is(wasm.instance.exports.run(), 1);
  return wasm;
  const view = new DataView(memory.buffer);
  // The two static strings returned here are stored in different module imports
  // so this is a pretty important thing to get right.
  const helloPtr = wasm.instance.exports.helloTest();
  t.is(decodeText(view, helloPtr), "hello");

  const worldPtr = wasm.instance.exports.worldTest();
  t.is(decodeText(view, worldPtr), "world");

  return wasm;
});

// FIXME: because filepaths are stored in the dpendency tree they do not work in
// the CI. Could be fixed with storing path differently.
//
// test("build Tree", t => {
//   const filepath = path.resolve(__dirname, "./index.walt");
//   const tree = buildTree(filepath);
//   console.log(Object.keys(tree.root.deps));
//   t.snapshot(tree);
// });
//
// test("merge Statics", t => {
//   const filepath = path.resolve(__dirname, "./index.walt");
//   const tree = buildTree(filepath);
//
//   const statics = mergeStatics(tree);
//   t.snapshot(statics);
// });
//
// test("assemble", t => {
//   const filepath = path.resolve(__dirname, "./index.walt");
//   const filename = filepath.split("/").pop();
//   const src = fs.readFileSync(filepath, "utf8");
//   const options = {
//     version: 0x1,
//     filename,
//     filepath,
//     lines: src.split("/n"),
//     src,
//   };
//
//   const tree = buildTree(filepath);
//   const statics = mergeStatics(tree);
//   const opcodes = assemble(tree, { ...options, linker: { statics } });
//
//   t.snapshot(opcodes);
// });
