/**
 * Walt build tools
 *
 * here be dragons
 *
 * @author Arthur Buldauskas arthurbuldauskas@gmail.com
 */

"use strict";

const invariant = require("invariant");
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

          if (type.value === "Memory") {
            hasMemory = true;
          }
        },
      })(fields);
    },
  })(ast);

  return [imports, hasMemory];
}

// Build a dependency tree of ASTs given a root module
function buildTree(index, api) {
  const modules = {};

  const dependency = (module, parent) => {
    const filepath = api.resolve(module);
    if (modules[filepath] != null) {
      return modules[filepath];
    }

    const src = api.getFileContents(module, parent, "utf8");
    const basic = api.parser(src);
    const [nestedImports, hasMemory] = parseImports(basic, api);

    const deps = {};

    Object.keys(nestedImports).forEach(mod => {
      if (mod.indexOf(".") === 0) {
        const dep = dependency(mod, filepath);
        deps[mod] = dep;
      }
    });

    const patched = inferImportTypes(basic, deps, api);
    const ast = api.semantics(patched);

    api.validate(ast, {
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

  const root = dependency(index, null);

  return {
    root,
    modules,
  };
}

// Assemble all AST into opcodes/instructions
function assemble(tree, options, api) {
  return Object.entries(tree.modules).reduce((opcodes, [filepath, mod]) => {
    // There are two cases when we should generate a DATA section for module,
    // it has statics OR it imports a memory. As then it needs to share the
    // same information about the memory layout as the rest of the application.
    let statics = mod.ast.meta.AST_METADATA.statics;
    if (Object.keys(statics).length > 0 || mod.hasMemory) {
      // Use global statics object
      statics = options.linker.statics;
    }

    const code = api.generator(
      mod.ast,
      Object.assign({}, options, { filename: mod.filepath.split('/').slice(-1)[0], linker: { statics } })
    );
    const wasm = api.emitter(code, options).buffer();

    return Object.assign({}, opcodes, {
      [filepath]: wasm,
    });
  }, {});
}

function compile(filepath, api) {
  const filename = filepath.split("/").pop();

  const options = {
    version: 0x1,
    filename,
    filepath,
    encodeNames: true
  };

  const tree = buildTree(filepath, api);
  const statics = mergeStatics(tree);
  const opcodes = assemble(
    tree,
    Object.assign({}, options, { linker: { statics } }),
    api
  );

  return Object.assign(tree, {
    statics,
    opcodes,
    options,
  });
}

// Build the final binary Module set
function build(importsObj, tree) {
  const modules = {};

  const instantiate = filepath => {
    if (modules[filepath] != null) {
      return modules[filepath];
    }

    const mod = tree.modules[filepath];
    const promise = Promise.all(
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
          tree.opcodes[filepath],
          Object.assign({}, imports, importsObj)
        );
      })
      .catch(e => {
        // TODO: do some logging here
        throw e;
      });

    modules[filepath] = promise;

    return promise;
  };

  modules[tree.root.filepath] = instantiate(tree.root.filepath);

  return modules[tree.root.filepath];
}

module.exports = {
  parseImports,
  build,
  compile,
  buildTree,
  mergeStatics,
  assemble,
};
