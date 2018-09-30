#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const compiler = require("walt-compiler");
const meow = require("meow");
const wrap = require("./src/wrap");

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

const wasm = compiler.compile(
  fs.readFileSync(path.resolve(process.cwd(), filepath), "utf8")
);
// Hot take - node writeFile should just accept an ArrayBuffer
const buffer = new Uint8Array(wasm.buffer());
fs.writeFileSync(
  path.resolve(process.cwd(), cli.flags.output),
  buffer,
  "binary"
);
