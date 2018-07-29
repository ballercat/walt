/**
 * Semantic Analysis
 *
 * The semantic analyzer below accepts a Walt AST and maps it, returning a new
 * transformed AST which contains all necessary data to generate the final
 * WebAssembly binary.
 *
 * The transformations may or may not create new nodes or attach metadata to
 * existing nodes.
 *
 * Metadata is information necessary to generate a valid binary, like type info.
 */

// @flow
import Syntax from "../Syntax";
import mapNode from "../utils/map-node";
import walkNode from "../utils/walk-node";
import { mapImport } from "./map-import";
import mapFunctionNode from "./map-function";
import closureImports from "../closure-plugin/imports";
import { parseGlobalDeclaration } from "./map-function/declaration";
import mapStructNode from "./map-struct";
import mapCharacterLiteral from "./map-char";
import { mapGeneric } from "./map-generic";
import hasNode from "../utils/has-node";
import { combineParsers } from "../plugin";
import { AST_METADATA } from "./metadata";
import type { NodeType } from "../flow/types";

// Make core semantic parsers
const make = options => {
  return {
    Typedef: (_, __) => _,
    // Read Import node, attach indexes if non-scalar
    Import: _ => mapImport(options),
    Declaration: next => node =>
      next(parseGlobalDeclaration(false, options, node)),
    ImmutableDeclaration: next => node =>
      next(parseGlobalDeclaration(true, options, node)),
    CharacterLiteral: next => node => next(mapCharacterLiteral(node)),
    Struct: _ => mapStructNode(options),
    FunctionDeclaration: _ => mapFunctionNode(options),
  };
};

function semantics(
  ast: NodeType,
  parsers: Array<(any) => any> = [
    () => ({
      "*": _ => (node, t) => ({ ...node, params: node.params.map(t) }),
    }),
    make,
  ]
): NodeType {
  const functions: { [string]: NodeType } = {};
  const globals: { [string]: NodeType } = {};
  const types: { [string]: NodeType } = {};
  const userTypes: { [string]: NodeType } = {};
  const table: { [string]: NodeType } = {};
  const hoist: NodeType[] = [];
  const hoistImports: NodeType[] = [];
  const statics: { [string]: null } = {};
  const options = {
    functions,
    globals,
    types,
    userTypes,
    table,
    hoist,
    hoistImports,
    statics,
  };

  if (hasNode(Syntax.Closure, ast)) {
    ast = { ...ast, params: [...closureImports(), ...ast.params] };
  }
  // Types have to be pre-parsed before the rest of the program
  const astWithTypes = mapNode({
    [Syntax.Export]: (node, transform) => {
      const [maybeType] = node.params;
      if (
        maybeType != null &&
        [Syntax.Typedef, Syntax.Struct].includes(maybeType.Type)
      ) {
        return transform({
          ...maybeType,
          meta: {
            ...maybeType.meta,
            EXPORTED: true,
          },
        });
      }
      return node;
    },
    [Syntax.Typedef]: (node, _) => {
      let argumentsCount = 0;
      const defaultArgs = [];
      walkNode({
        Assignment(assignment) {
          const defaultValue = assignment.params[1];
          defaultArgs.push(defaultValue);
        },
        Type() {
          argumentsCount += 1;
        },
      })(node);
      const parsed = {
        ...node,
        meta: {
          ...node.meta,
          FUNCTION_METADATA: {
            argumentsCount,
          },
          DEFAULT_ARGUMENTS: defaultArgs,
        },
      };
      types[node.value] = parsed;
      return parsed;
    },
    [Syntax.GenericType]: mapGeneric({ types }),
  })(ast);

  const combined = combineParsers(parsers.map(p => p(options)));
  const patched = mapNode(combined)(astWithTypes);

  return {
    ...patched,
    meta: {
      ...patched.meta,
      // Attach information collected to the AST
      [AST_METADATA]: { functions, globals, types, userTypes, statics },
    },
    params: [...hoistImports, ...patched.params, ...hoist],
  };
}

export default semantics;
