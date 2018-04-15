"use strict";

const path = require("path");
const fs = require("fs");
const make = require("./get-program");
const compiler = require("walt-compiler");

const MEMORY_KIND = 2;

function compile(filepath, parent) {
  const main = make(filepath);

  return {
    filepath,
    root: path.dirname(filepath),
    main,
    imports: {},
    exports: main.exports,
    programs: Object.assign(
      {
        [filepath]: main,
      },
      parent.programs
    ),
    options: parent.options,
    resolve,
  };
}

function instantiate(filepath, parent) {
  if (parent.programs[filepath]) {
    return parent.programs[filepath];
  }

  const program = compile(filepath, parent);
  program.imports = program.main.Imports.reduce((acc, dep) => {
    const resolved = program.resolve(dep, program);
    if (resolved == null) {
      return acc;
    }

    acc[dep.module] = resolved;

    return acc;
  }, {});

  parent.programs[filepath] = program;

  return parent.programs[filepath];
}

function resolve(dep, parent) {
  const { logger } = parent.options;
  if (dep.module.indexOf(".") !== 0) {
    return null;
  }

  const { programs, root } = parent;
  const resolved = path.resolve(parent.root, dep.module);
  if (!fs.existsSync(resolved)) {
    logger.warn(`Top level dependency which is not a module ${resolved}`);
    return null;
  }

  const program = instantiate(resolved, parent);

  if (!program.main.Exports.find(({ field }) => field === dep.field)) {
    logger.warn(`Field ${dep.field} is not exported by ${dep.module}`);
  }

  return program;
}

function build(importsObj, modules, field, dep) {
  if (modules[dep.filepath] != null) {
    return modules[dep.filepath];
  }

  const P = Promise.all(
    Object.entries(dep.imports).map(([key, value]) => {
      return build(importsObj, modules, key, value).then(result => [
        key,
        result,
      ]);
    })
  )
    .then(importsMap => {
      const imports = importsMap.reduce((acc, [key, mod]) => {
        acc[key] = mod.instance.exports;
        return acc;
      }, {});

      return WebAssembly.instantiate(
        compiler.emitter(dep.main, dep.options).buffer(),
        Object.assign({}, imports, importsObj)
      );
    })
    .catch(e => {
      dep.options.logger.warn(`Issue building ${field} `, e);
      throw e;
    });

  modules[dep.filepath] = P;
  return P;
}

function link(filepath, options = { logger: console }) {
  const program = instantiate(filepath, {
    programs: {},
    options: Object.assign(
      {
        version: 0x1,
      },
      options
    ),
    resolve,
  });

  const wasm = compiler.emitter(program.main, program.options);

  return (importsObj = {}) => build(importsObj, {}, "root", program);
}

module.exports = { link };
