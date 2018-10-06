/**
 * Walt linker
 *
 * here be dragons
 *
 * @author Arthur Buldauskas arthurbuldauskas@gmail.com
 */

"use strict";

const compiler = require("walt-compiler");
const buildTools = require("walt-buildtools");
const fs = require("fs");
const path = require("path");
const invariant = require("invariant");

/**
 * Link Walt programs together.
 *
 * @param {String} filepath The full path to the index file
 * @param {Object} options  Reserved
 * @param {Object} api      Custom compiler. Is the node module by default.
 *
 *                          This is here to allow for the compiler to test itself
 *                          during development. It's a simple object which has the
 *                          collection of functions which make up the entire compiler.
 *                          This is useful for any sort of diagnostics you'd like to
 *                          run while linking modules as well.
 *
 * @return {Function} The build function which takes an importsObj and returns a {Promise}
 */

const resolve = (dirname = __dirname) => (file, parent) => {
  const root = parent ? path.dirname(parent) : dirname;
  return path.resolve(root, file.slice(-5) === ".walt" ? file : file + ".walt");
};

const getFileContents = resolver => (file, parent, mode) => {
  return fs.readFileSync(resolver(file, parent), mode);
};

function link(file, options = { logger: console }, api) {
  api = api || compiler;

  const parser = api.makeParser([]);
  const fragment = api.makeFragment(parser);
  const { semantics } = api;

  api = Object.assign({}, api, {
    parser,
    fragment,
    semantics(ast) {
      return semantics(ast, [], { parser, fragment });
    },
  });

  if (api.resolve == null) {
    api = Object.assign(
      {
        resolve: resolve(path.dirname(file)),
        getFileContents: getFileContents(resolve(path.dirname(file))),
      },
      api
    );
  }

  const tree = buildTools.compile(file, api);

  function walt(importsObj = {}) {
    return buildTools.build(importsObj, tree, api);
  }

  walt.tree = tree;

  return walt;
}

module.exports = link;
