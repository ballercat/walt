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
const compiler = require("walt-compiler");
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
            new Set(imports[module.value].concat(identifier.value))
          );
        },
      })(fields);
    },
  })(ast);

  return imports;
}

// Build a dependency tree of ASTs given a root module
function buildTree(index) {
  const modules = {};

  const dependency = (module, resolve) => {
    const filepath = resolve(module);
    if (modules[filepath] != null) {
      return modules[filepath];
    }

    const src = fs.readFileSync(filepath, "utf8");
    const basic = compiler.parser(src);
    const nestedImports = parseImports(basic);

    const deps = {};

    Object.keys(nestedImports).forEach(mod => {
      if (mod.indexOf(".") === 0) {
        const dep = dependency(mod, file =>
          path.resolve(path.dirname(filepath), file)
        );
        deps[mod] = dep;
      }
    });

    const patched = inferImportTypes(basic, deps);
    const ast = compiler.semantics(patched);

    // compiler.validate(ast, {
    //   lines: src.split("\n"),
    //   filname: module,
    // });

    const result = {
      ast,
      deps,
      filepath,
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
function assemble(tree, options) {
  return Object.entries(tree.modules).reduce((opcodes, [filepath, mod]) => {
    // If the child does not define any static data then we should not attempt to
    // generate any. Even if there are GLOBAL data sections.
    let statics = mod.ast.meta.AST_METADATA.statics;
    if (Object.keys(statics).length > 0) {
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

function compile(filepath) {
  const filename = filepath.split("/").pop();

  const options = {
    version: 0x1,
    filename,
    filepath,
  };

  const tree = buildTree(filepath);
  const statics = mergeStatics(tree);
  const opcodes = assemble(
    tree,
    Object.assign({}, options, { linker: { statics } })
  );

  return Object.assign(tree, {
    statics,
    opcodes,
    options,
  });
}

// Build the final binary Module set
function build(importsObj, modules, tree) {
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
          compiler.emitter(tree.opcodes[filepath], tree.options).buffer(),
          Object.assign({}, imports, importsObj)
        );
      })
      .catch(e => {
        // TODO: do some logging here
        throw e;
      });
  };

  modules[tree.root.filepath] = instantiate(tree.root.filepath);

  return modules[tree.root.filepath];
}

function link(filepath, options = { logger: console }) {
  const tree = compile(filepath);

  return (importsObj = {}) => build(importsObj, {}, tree);
}

module.exports = {
  link,
  parseImports,
  compile,
  buildTree,
  mergeStatics,
  assemble,
};
