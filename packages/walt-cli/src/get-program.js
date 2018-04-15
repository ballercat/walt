"use strict";
const fs = require("fs");
const path = require("path");
const compiler = require("walt-compiler");

module.exports = function getProgram(filepath, options = {}) {
  const filename = filepath.split("/").pop();
  const src = fs.readFileSync(path.resolve(filepath), "utf8");

  options = Object.assign(
    options,
    {
      version: 0x1,
      filename,
      lines: src.split("/n")
    },
    options
  );

  const untypedAST = compiler.parser(src);
  const typedAST = compiler.semantics(untypedAST);
  compiler.validate(typedAST, options);

  return compiler.generator(typedAST, options);
};
