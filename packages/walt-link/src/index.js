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

// Patch missing type imports with the give dependencies
function patchInferedTypes(ast, deps) {
  const newTypes = [];
  const patch = compiler.mapNode({
    Import(importNode, _) {
      const module = importNode.params[1];

      return compiler.mapNode({
        Pair(pair, _) {
          return pair;
        },
        // Fix any identifiers here
        Identifier(identifier, _) {
          const depAST = deps[module.value].ast;
          const { functions, globals } = depAST.meta.AST_METADATA;
          const fun = functions[identifier.value];
          if (fun != null) {
            // function arguments and params are _always_ the first two params
            const [args, result] = fun.params;
            const typeArgs = {
              ...args,
              // function arguments are a identifier : type pairs
              // for type declarations we only need the types
              params: args.params.filter(Boolean).map(argNode => {
                return argNode.params[1];
              }),
            };
            const newType = {
              ...identifier,
              type: result.type,
              params: [typeArgs, result],
              value: `__auto_type_${identifier.value}`,
              Type: "Typedef",
            };
            newTypes.push(newType);

            // for an import to become valid at this point it only needs to be an
            // identifier : identifier pair :)
            const patched = {
              ...identifier,
              value: ":",
              params: [identifier, { ...identifier, value: newType.value }],
              Type: "Pair",
            };

            return patched;
          }

          const glbl = globals[identifier.value];
          if (glbl != null) {
            // just set to the global type pair and peace out
            return {
              ...identifier,
              value: ":",
              params: [
                identifier,
                {
                  ...identifier,
                  value: glbl.type,
                  type: glbl.type,
                  Type: "Type",
                },
              ],
              Type: "Pair",
            };
          }

          return identifier;
        },
      })(importNode);
    },
  })(ast);

  // types can be defined anywhere in a program, even as the very last bit
  return {
    ...patch,
    params: [...patch.params, ...newTypes],
  };
}

// Build a dependency tree of ASTs given a root module
function buildTree(options) {
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

    const patched = patchInferedTypes(basic, deps);
    const ast = compiler.semantics(patched);

    compiler.validate(ast, {
      lines: src.split("\n"),
      filname: module,
    });

    const result = {
      ast,
      deps,
      filepath,
    };

    modules[filepath] = result;

    return result;
  };

  const root = dependency(options.filepath, file => file);

  return {
    tree: {
      root,
    },
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

  const tree = buildTree(options);
  const statics = mergeStatics(tree);
  const binaries = buildBinaries(tree, { ...options, linker: { statics } });

  return {
    ...tree,
    statics,
    binaries,
    options,
  };
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
          compiler.emitter(tree.binaries[filepath], tree.options).buffer(),
          { ...imports, ...importsObj }
        );
      })
      .catch(e => {
        // TODO: do some logging here
        throw e;
      });
  };

  modules[tree.tree.root.filepath] = instantiate(tree.tree.root.filepath);

  return modules[tree.tree.root.filepath];
}

function link(filepath, options = { logger: console }) {
  const tree = compile(filepath);

  return (importsObj = {}) => build(importsObj, {}, tree);
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
