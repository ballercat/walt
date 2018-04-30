"use strict";

const compiler = require("walt-compiler");

// Patch missing type imports with the give dependencies
function inferImportTypes(ast, deps) {
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
          const {
            functions,
            globals,
            types,
            userTypes,
          } = depAST.meta.AST_METADATA;
          const fun = functions[identifier.value];
          if (fun != null) {
            // function arguments and params are _always_ the first two params
            const [args, result] = fun.params;
            const typeArgs = Object.assign(
              {},
              args,
              // function arguments are a identifier : type pairs
              // for type declarations we only need the types
              {
                params: args.params.filter(Boolean).map(argNode => {
                  return argNode.params[1];
                }),
              }
            );
            const newType = Object.assign({}, identifier, {
              type: result.type,
              params: [typeArgs, result],
              value: `__auto_type_${identifier.value}`,
              Type: "Typedef",
            });
            newTypes.push(newType);

            // for an import to become valid at this point it only needs to be an
            // identifier : identifier pair :)
            const patched = Object.assign({}, identifier, {
              value: ":",
              params: [
                identifier,
                Object.assign({}, identifier, { value: newType.value }),
              ],
              Type: "Pair",
            });

            return patched;
          }

          const glbl = globals[identifier.value];
          if (glbl != null) {
            // just set to the global type pair and peace out
            return Object.assign({}, identifier, {
              value: ":",
              params: [
                identifier,
                Object.assign({}, identifier, {
                  value: glbl.type,
                  type: glbl.type,
                  Type: "Type",
                }),
              ],
              Type: "Pair",
            });
          }

          const externType = types[identifier.value];
          if (externType != null) {
            newTypes.push(Object.assign({}, externType));
          }

          const userType = userTypes[identifier.value];
          if (userType != null) {
            newTypes.push(Object.assign({}, userType));
          }

          return null;
        },
      })(importNode);
    },
  })(ast);

  // types can be defined anywhere in a program, even as the very last bit
  return Object.assign({}, patch, { params: newTypes.concat(patch.params) });
}

module.exports = {
  inferImportTypes,
};
