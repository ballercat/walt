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
import { mapImport } from "./map-import";
import mapFunctionNode from "./map-function";
import closureImports from "../closure-plugin/imports";
import { parseGlobalDeclaration } from "./map-function/declaration";
import mapStructNode from "./map-struct";
import { mapGeneric } from "./map-generic";
import hasNode from "../utils/has-node";
import { AST_METADATA } from "./metadata";
import type { NodeType } from "../flow/types";

export default function semantics(ast: NodeType): NodeType {
  const functions: { [string]: NodeType } = {};
  const globals: { [string]: NodeType } = {};
  const types: { [string]: NodeType } = {};
  const userTypes: { [string]: NodeType } = {};
  const table: { [string]: NodeType } = {};
  const hoist: NodeType[] = [];
  const hoistImports: NodeType[] = [];

  if (hasNode(Syntax.Closure, ast)) {
    ast = { ...ast, params: [...closureImports(), ...ast.params] };
  }
  // Types have to be pre-parsed before the rest of the program
  const astWithTypes = mapNode({
    [Syntax.Typedef]: (node, _) => {
      types[node.value] = node;
      return node;
    },
    [Syntax.GenericType]: mapGeneric({ types }),
  })(ast);

  const patched = mapNode({
    [Syntax.Typedef]: (_, __) => _,
    // Read Import node, attach indexes if non-scalar
    [Syntax.Import]: mapImport({ functions, types, globals }),
    [Syntax.Declaration]: parseGlobalDeclaration(false, { globals, types }),
    [Syntax.ImmutableDeclaration]: parseGlobalDeclaration(true, {
      globals,
      types,
    }),
    [Syntax.Struct]: mapStructNode({ userTypes }),
    [Syntax.FunctionDeclaration]: mapFunctionNode({
      hoist,
      hoistImports,
      types,
      globals,
      functions,
      userTypes,
      table,
    }),
  })(astWithTypes);

  return {
    ...patched,
    meta: {
      ...patched.meta,
      // Attach information collected to the AST
      [AST_METADATA]: { functions, globals, types, userTypes },
    },
    params: [...hoistImports, ...patched.params, ...hoist],
  };
}
