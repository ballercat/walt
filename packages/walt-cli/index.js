#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const compiler = require("walt-compiler");
const meow = require("meow");
const wrap = require("./src/wrap");
const write = require("./src/write");
const compileFromFile = require("./src/compile-from-file");

const cli = meow(
  `
        Usage
          $ walt <file> <options>

        Options
          --output, -o  Output filepath. default: o.wasm
          --wrap, -w    Wrap with JS. default: false
          --names, -n   Emit names section for debugging. default: false
`,
  {
    flags: {
      output: {
        type: "string",
        alias: "o",
        default: "o.wasm"
      },
      wrap: {
        type: "boolean",
        alias: "w",
        default: false
      },
      link: {
        type: "boolean",
        alias: "l",
        default: false
      },
      names: {
        type: "boolean",
        alias: "n",
        default: false
      }
    }
  }
);

const filepath = cli.input[0];
const options = {
  encodeNames: cli.flags.names
};

if (cli.flags.wrap) {
  const output = wrap(path.resolve(process.cwd(), filepath), options);
  fs.writeFileSync(
    path.resolve(process.cwd(), cli.flags.output),
    output,
    "utf8"
  );
  process.exit();
}

compileFromFile(path.resolve(process.cwd(), filepath), compiler.compile, fs)
  .then(wasm => {
    const view = new Uint8Array(wasm.buffer());
    const buffer = Buffer.from(view);

    return write(buffer, path.resolve(process.cwd(), cli.flags.output), fs);
  })
  .then(() => {
    console.log(`Compiled to ${cli.flags.output}`);
  })
  .catch(err => console.warn("Compile failed", err));
