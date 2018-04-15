"use strict";

const compiler = require("walt-compiler");
const meow = require("meow");
const getProgram = require("./src/get-program");
const { link } = require("./src/link");

const cli = meow(
  `
        Usage
          $ walt <file> <options>

        Options
          --output, -o  Output filepath. default: o.wasm
          --wrap, -w    Wrap with JS. default: false
          --link, -l    Link with imports, requires -w. default: false.
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

if (cli.flags.link && !cli.flags.wrap) {
  throw new Error("--link can only link wrapped modules. Specify --wrap");
}

const filepath = cli.input[0];
const options = {
  encodeNames: cli.flags.names
};
const Program = getProgram(filepath, options);
link(Program, filepath);
const binary = compiler.emitter(Program, options);
