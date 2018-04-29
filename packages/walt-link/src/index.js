"use strict";

const path = require("path");
const fs = require("fs");
const compiler = require("walt-compiler");

const MEMORY_KIND = 2;
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));

const parseIntoAST = compose(compiler.semantics, compiler.parser);

function mergeStatics(tree = {}) {
  let statics = {};

  Object.values(tree.modules).forEach(mod => {
    const localStatics = mod.ast.meta.AST_METADATA.statics;
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

// Build a dependency tree of ASTs given a root module
function buildTree(options, rootResolve) {
  const rootAST = parseIntoAST(options.src);
  const rootImports = parseImports(rootAST);
  const mod = {
    ast: rootAST,
    deps: {},
    filepath: options.filepath,
  };
  const modules = {
    [options.filepath]: mod,
  };

  const tree = {
    root: mod,
  };

  const dependency = (module, resolve) => {
    const filepath = resolve(module);
    if (modules[filepath] != null) {
      return modules[filepath];
    }

    const src = fs.readFileSync(filepath, "utf8");
    const ast = parseIntoAST(src);
    const nestedImports = parseImports(ast);
    const deps = {};

    const result = {
      ast,
      deps: {},
      filepath,
    };

    Object.keys(nestedImports).forEach(mod => {
      if (mod.indexOf(".") === 0) {
        const dep = dependency(mod, file =>
          path.resolve(path.dirname(filepath), file)
        );
        result.deps[mod] = dep;
      }
    });

    modules[filepath] = result;

    return result;
  };

  // Kick off the process of building child deps, everything else is recursive
  Object.keys(rootImports).forEach(module => {
    if (module.indexOf(".") === 0) {
      // parse the import into an ast
      const dep = dependency(module, file =>
        path.resolve(path.dirname(options.filepath), file)
      );

      tree.root.deps[module] = dep;
    }
  });

  return {
    tree,
    modules,
  };
}

function buildBinaries(tree, options) {
  const binaries = {};

  Object.entries(tree.modules).forEach(([filepath, mod]) => {
    // If the child does not define any static data then we should not attempt to
    // generate any. Even if there are GLOBAL data sections.
    let statics = mod.ast.meta.AST_METADATA.statics;
    if (Object.keys(statics).length > 0) {
      // Use global statics object
      statics = options.linker.statics;
    }
    const binary = compiler.generator(mod.ast, {
      ...options,
      linker: { statics },
    });
    binaries[filepath] = binary;
  });

  return binaries;
}

function compile(filepath) {
  const filename = filepath.split("/").pop();
  const src = fs.readFileSync(path.resolve(filepath), "utf8");

  const options = {
    version: 0x1,
    filename,
    filepath,
    lines: src.split("/n"),
    src,
  };

  const tree = buildTree(options, resolve);
  const statics = mergeStatics(tree);
  const binaries = buildBinaries(tree, { ...options, linker: { statics } });

  return {
    ...tree,
    statics,
    binaries,
    options,
  };
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
function build(importsObj, modules, field, tree) {
  const instantiate = filepath => {
    if (modules[filepath] != null) {
      return modules[filepath];
    }

    const mod = tree.modules[filepath];
    return Promise.all(
      Object.entries(mod.deps).map(([key, dep]) => {
        return instantiate(dep.filepath).then(result => [key, result]);
      })
    )
      .then(importsMap => {
        const imports = importsMap.reduce((acc, [key, module]) => {
          acc[key] = module.instance.exports;
          return acc;
        }, {});

        return WebAssembly.instantiate(
          compiler.emitter(tree.binaries[filepath], tree.options).buffer(),
          { ...imports, ...importsObj }
        );
      })
      .catch(e => {
        // mod.options.logger.warn(`Issue building ${field} `, e);
        throw e;
      });
  };

  modules[tree.tree.root.filepath] = instantiate(tree.tree.root.filepath);

  return modules[tree.tree.root.filepath];
}

function link(filepath, options = { logger: console }) {
  const tree = compile(filepath);

  return (importsObj = {}) => build(importsObj, {}, "root", tree);
}

module.exports = {
  link,
  parseImports,
  parseIntoAST,
  compile,
  buildTree,
  mergeStatics,
  buildBinaries,
};
