import buildTools from 'walt-buildtools';
import path from 'path';
import fs from 'fs';
import { getText } from '../utils/string';
import semantics from '../semantics';
import validate from '../validation';
import makeParser from '../parser';
import { makeFragment } from '../parser/fragment';
import emitter from '../emitter';
import generator from '../generator';
import { compile, mapNode, walkNode, prettyPrintNode, debug } from '..';
import print from 'walt-buildtools/print';

export const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(
    compile(src, { encodeNames: true }).buffer(),
    imports
  );

function resolve(file, parent) {
  const root = parent ? path.dirname(parent) : __dirname;
  return path.resolve(root, file.slice(-5) === '.walt' ? file : file + '.walt');
}

function getFileContents(file, parent, mode) {
  return fs.readFileSync(resolve(file, parent), mode);
}
function link(file, api) {
  const tree = buildTools.compile(file, api);

  function walt(importsObj = {}) {
    return buildTools.build(importsObj, tree, api);
  }

  walt.tree = tree;

  return walt;
}

export const harness = (
  filepath,
  env,
  { printNode = false, printBinary = false } = {}
) => t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const decodeText = getText(memory);
  const parser = makeParser([]);
  const fragment = makeFragment(parser);

  const { log } = console;
  const build = link(filepath, {
    resolve,
    getFileContents,
    mapNode,
    walkNode,
    parser,
    semantics(ast) {
      const sast = semantics(ast, [], { parser, fragment });
      if (printNode) {
        log(print(sast));
      }
      return sast;
    },
    validate,
    emitter(...args) {
      const wasm = emitter(...args);
      if (printBinary) {
        log(debug(wasm));
      }
      return wasm;
    },
    generator,
    prettyPrintNode,
  });
  return build({
    env: {
      memory,
      MEMORY_OFFSET: 0,
      log,
      assert(strPointer, value, expected) {
        const text = decodeText(strPointer);

        t.is(value, expected, text);
      },
      ...env,
    },
  }).then(module => module.instance.exports.run());
};
