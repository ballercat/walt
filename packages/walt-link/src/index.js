"use strict";

const path = require("path");
const fs = require("fs");
const compiler = require("walt-compiler");

const MEMORY_KIND = 2;
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const parseIntoAST = compose(compiler.semantics, compiler.parser);

function mergeStatics(syntaxTrees = {}) {
  let statics = {};

  Object.values(syntaxTrees).forEach(ast => {
    const localStatics = ast.meta.AST_METADATA.statics;
    statics = { ...statics, ...localStatics };
  });

  return statics;
}

// Parse imports out of an ast
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

function getFullSyntaxTree(options, rootResolve) {
  const rootAST = parseIntoAST(options.src);
  const rootImports = parseImports(rootAST);

  const syntaxTrees = {
    root: rootAST,
  };

  const parseChildAst = (module, resolve) => {
    const filepath = resolve(module);
    const src = fs.readFileSync(filepath, "utf8");
    const ast = parseIntoAST(src);
    const nestedImports = parseImports(ast);

    syntaxTrees[module] = ast;

    Object.keys(nestedImports).forEach(mod => {
      if (mod.indexOf(".") === 0 && syntaxTrees[mod] == null) {
        parseChildAst(mod, file => resolve(path.dirname(filepath), mod));
      }
    });
  };

  Object.keys(rootImports).forEach(module => {
    if (module.indexOf(".") === 0 && syntaxTrees[module] == null) {
      // parse the import into an ast
      parseChildAst(module, file => rootResolve(file));
    }
  });

  return syntaxTrees;
}

function buildBinaries(asts, options) {}

function compile(filepath, parent) {
  const filename = filepath.split("/").pop();
  const src = fs.readFileSync(path.resolve(filepath), "utf8");

  const options = {
    version: 0x1,
    filename,
    filepath,
    lines: src.split("/n"),
    src,
  };

  const asts = getFullSyntaxTree(options, resolve);
  const statics = mergeStatics(asts);
  const binaries = buildBinaries(asts, { ...options, linker: { statics } });

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

module.exports = {
  link,
  parseImports,
  parseIntoAST,
  compile,
  getFullSyntaxTree,
  mergeStatics,
  buildBinaries,
};
