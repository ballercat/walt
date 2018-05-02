const test = require("ava");
const { link, buildTree, assemble, mergeStatics, parseImports } = require("..");
const path = require("path");
const fs = require("fs");
const { stringDecoder } = require("walt-compiler");

const decodeText = (view, ptr) => {
  const decoder = stringDecoder(view, ptr);
  let iterator = decoder.next();
  let text = "";
  while (!iterator.done) {
    text += String.fromCodePoint(iterator.value);
    iterator = decoder.next();
  }

  return text;
};

test("returns (src: string) => (importsObj) => Promise<Wasm>", async t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const factory = link(path.resolve(__dirname, "./index.walt"));
  t.is(typeof factory === "function", true, "linker returns a factory");
  const wasm = await factory({
    env: { memory },
  });
  t.is(typeof wasm.instance.exports.run === "function", true);
  t.is(wasm.instance.exports.run(), 1);

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
