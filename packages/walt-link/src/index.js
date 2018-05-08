/**
 * Walt linker
 *
 * here be dragons
 *
 * @author Arthur Buldauskas arthurbuldauskas@gmail.com
 */

"use strict";

const path = require("path");
const fs = require("fs");
const waltCompiler = require("walt-compiler");
const { inferImportTypes } = require("./patches");

function mergeStatics(tree = {}) {
  let statics = {};

  Object.values(tree.modules).forEach(mod => {
    const localStatics = mod.ast.meta.AST_METADATA.statics;
    Object.assign(statics, localStatics);
  });

  return statics;
}

// Parse imports out of an ast
function parseImports(ast, compiler) {
  const imports = {};
  let hasMemory = false;

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
          const [identifier, type] = pair.params;
          imports[module.value] = Array.from(
            new Set(imports[module.value].concat(identifier.value))
          );
          if (type === "Memory") {
            hasMemory = true;
          }
        },
      })(fields);
    },
  })(ast);

  return [imports, hasMemory];
}

// Build a dependency tree of ASTs given a root module
function buildTree(index, compiler) {
  const modules = {};

  const dependency = (module, resolve) => {
    const filepath = resolve(module);
    if (modules[filepath] != null) {
      return modules[filepath];
    }

    const src = fs.readFileSync(filepath, "utf8");
    const basic = compiler.parser(src);
    const [nestedImports, hasMemory] = parseImports(basic, compiler);

    const deps = {};

    Object.keys(nestedImports).forEach(mod => {
      if (mod.indexOf(".") === 0) {
        const dep = dependency(mod, file =>
          path.resolve(
            path.dirname(filepath),
            file.slice(-5) === ".walt" ? file : file + ".walt"
          )
        );
        deps[mod] = dep;
      }
    });

    const patched = inferImportTypes(basic, deps, compiler);
    const ast = compiler.semantics(patched);

    compiler.validate(ast, {
      lines: src.split("\n"),
      filename: module.split("/").pop(),
    });

    const result = {
      ast,
      deps,
      filepath,
      hasMemory,
    };
    modules[filepath] = result;

    return result;
  };

  const root = dependency(index, file => file);

  return {
    root,
    modules,
  };
}

// Assemble all AST into opcodes/instructions
function assemble(tree, options, compiler) {
  return Object.entries(tree.modules).reduce((opcodes, [filepath, mod]) => {
    // There are two cases when we should generate a DATA section for module,
    // it has statics OR it imports a memory. As then it needs to share the
    // same information about the memory layout as the rest of the application.
    let statics = mod.ast.meta.AST_METADATA.statics;
    if (Object.keys(statics).length > 0 || mod.hasMemory) {
      // Use global statics object
      statics = options.linker.statics;
    }
    const instructions = compiler.generator(
      mod.ast,
      Object.assign({}, options, { linker: { statics } })
    );

    return Object.assign({}, opcodes, {
      [filepath]: instructions,
    });
  }, {});
}

function compile(filepath, compiler) {
  const filename = filepath.split("/").pop();

  const options = {
    version: 0x1,
    filename,
    filepath,
  };

  const tree = buildTree(filepath, compiler);
  const statics = mergeStatics(tree);
  const opcodes = assemble(
    tree,
    Object.assign({}, options, { linker: { statics } }),
    compiler
  );

  return Object.assign(tree, {
    statics,
    opcodes,
    options,
  });
}

// Build the final binary Module set
function build(importsObj, tree, compiler) {
  const modules = {};

  const instantiate = filepath => {
    if (modules[filepath] != null) {
      return modules[filepath];
    }

    const mod = tree.modules[filepath];
    const modPromise = Promise.all(
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
          compiler.emitter(tree.opcodes[filepath], tree.options).buffer(),
          Object.assign({}, imports, importsObj)
        );
      })
      .catch(e => {
        // TODO: do some logging here
        throw e;
      });
    modules[filepath] = modPromise;

    return modPromise;
  };

  modules[tree.root.filepath] = instantiate(tree.root.filepath);

  return modules[tree.root.filepath];
}

/**
 * Link Walt programs together.
 *
 * @param {String} filepath The full path to the index file
 * @param {Object} options  Reserved
 * @param {Object} compiler Custom compiler. Is the node module by default.
 *
 *                          This is here to allow for the compiler to test itself
 *                          during development. It's a simple object which has the
 *                          collection of functions which make up the entire compiler.
 *                          This is useful for any sort of diagnostics you'd like to
 *                          run while linking modules as well.
 *
 * @return {Function} The build function which takes an importsObj and returns a {Promise}
 */
function link(
  filepath,
  options = { logger: console },
  compiler = waltCompiler
) {
  const tree = compile(filepath, compiler);

  function walt(importsObj = {}) {
    return build(importsObj, tree, compiler);
  }

  walt.tree = tree;

  return walt;
}

module.exports = {
  link,
  parseImports,
  compile,
  buildTree,
  mergeStatics,
  assemble,
};
