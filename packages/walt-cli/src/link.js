"use strict";

const path = require("path");
const fs = require("fs");
const getProgram = require("./get-program");

const MEMORY_KIND = 2;

function link(waltProgram, filepath) {
  const Programs = {
    [filepath]: waltProgram
  };

  const imports = [];
  let memoryImport = null;
  const relativeRoot = path.dirname(filepath);

  for (let i = 0; i < waltProgram.Imports.length; i++) {
    const dependency = waltProgram.Imports[i];
    const isEnvironment = "env" == dependency.module;

    if (isEnvironment && dependency.kind === MEMORY_KIND) {
      memoryImport = dependency;
    }

    if (!isEnvironment) {
      const resolvedPath = path.resolve(relativeRoot, dependency.module);
      if (!fs.existsSync(resolvedPath)) {
        console.warn(
          `Top level dependency which is not a module ${resolvedPath}`
        );
        continue;
      }

      let depProgram = Programs[resolvedPath];
      if (depProgram == null) {
        depProgram = getProgram(resolvedPath);
        Programs[resolvedPath] = depProgram;
      }

      if (!depProgram.Exports.find(({ field }) => field === dependency.field)) {
        console.warn(
          `Field ${dependency.field} is not exported by ${dependency.module}`
        );
      }
    }
  }

  if (memoryImport != null) {
  }
}

module.exports = {
  link
};
