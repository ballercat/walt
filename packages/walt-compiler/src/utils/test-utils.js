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

export const compileAndRun = (
  src,
  imports,
  options = { encodeNames: true }
) => {
  const output = compile(src, options);
  if (options.debug) {
    // eslint-disable-next-line
    console.log(debug(output.wasm));
  }
  return WebAssembly.instantiate(output.buffer(), imports);
};

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
  { printNode = false, printBinary = false, prettyPrint = false } = {}
) => t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const decodeText = getText(memory);
  const parser = makeParser([]);
  const stmt = makeFragment(parser);

  const { log } = console;
  let wasm;
  let sast;
  const build = link(filepath, {
    resolve,
    getFileContents,
    mapNode,
    walkNode,
    parser,
    semantics(ast) {
      sast = semantics(ast, [], { parser, stmt });
      if (printNode) {
        log(print(sast));
      }
      if (prettyPrint) {
        log(prettyPrintNode(sast));
      }

      const exports = sast.meta.AST_METADATA.exports;
      if (
        exports.INTROSPECT_PRETTY_PRINT &&
        exports.INTROSPECT_PRETTY_PRINT.params[0].value === '1'
      ) {
        log(prettyPrintNode(sast));
      }

      if (
        exports.INTROSPECT_PRINT_NODES &&
        exports.INTROSPECT_PRINT_NODES.params[0].value === '1'
      ) {
        log(print(sast));
      }
      return sast;
    },
    validate,
    emitter(...args) {
      wasm = emitter(...args);
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
  }).then(module => {
    const { run, INTROSPECT_DEBUG_BINARY } = module.instance.exports;

    if (INTROSPECT_DEBUG_BINARY) {
      log(debug(wasm));
    }

    // Execute the assertions _inside_ the module
    run();

    return module;
  });
};
