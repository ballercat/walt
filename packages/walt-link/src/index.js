"use strict";

const path = require("path");
const fs = require("fs");
const compiler = require("walt-compiler");

const MEMORY_KIND = 2;
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const parseIntoAST = compose(compiler.semantics, compiler.parser);

function mergeDataSections(syntaxTrees = []) {}

function parseImports(ast) {
  const imports = {};

  compiler.walkNode({
    Import(node, _) {
      // Import nodes consist of field and a string literal node
      const [fields, module] = node.params;
      if (imports[module.value] == null) {
        imports[module.value] = [];
      }

      compiler.walkNode({
        Pair(pair, __) {
          // Import pairs consist of identifier and type
          const [identifier] = pair.params;
          imports[module.value] = Array.from(
            new Set([...imports[module.value], identifier.value])
          );
        },
      })(fields);
    },
  })(ast);

  return imports;
}

function compile(filepath, parent) {
  const filename = filepath.split("/").pop();
  const src = fs.readFileSync(path.resolve(filepath), "utf8");
  // console.log("parent", parent.filename, parent.statics);
  const options = {
    version: 0x1,
    filename,
    lines: src.split("/n"),

    linker: {
      statics: parent.statics,
    },
  };

  const ast = parseIntoAST(src);
  const imports = parseImports(ast);

  // If the child does not define any static data then we should not attempt to
  // generate any. Even if there are GLOBAL data sections.
  let statics = ast.meta.AST_METADATA.statics;
  if (Object.keys(statics).length > 0) {
    // merge statics with parent
    statics = { ...parent.statics, statics };
    parent.statics = statics;
  }
  const main = compiler.generator(ast, {
    ...options,
    linker: { statics },
  });

  const program = {
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
    statics: ast.meta.AST_METADATA.statics,
  };

  program.imports = main.Imports.reduce((acc, dep) => {
    const resolved = program.resolve(dep, program);
    if (resolved == null) {
      return acc;
    }

    acc[dep.module] = resolved;

    return acc;
  }, {});

  return program;
}

function instantiate(filepath, parent) {
  if (parent.programs[filepath]) {
    return parent.programs[filepath];
  }

  const program = compile(filepath, parent);

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

// Build the final binary Module set
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

module.exports = { link, parseImports, parseIntoAST };
