import test from "ava";
import link from "walt-link";
import path from "path";

test("tokenizer", t => {
  const build = link(path.resolve(__dirname, "../tokenizer.walt"));
  const memory = new WebAssembly.Memory({ initial: 1 });
  const source = "const x: i32 = 42;";
  let index = 0;
  const readChar = () => source.codePointAt(index++);
  return build({
    env: { memory, log: console.log },
    buffer: { readChar },
  }).then(result => {
    const collection = result.instance.exports.tokenize();
  });
});
