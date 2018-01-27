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
import walkNode from "../utils/walk-node";
import mapNode from "../utils/map-node";
import { mapImport } from "./map-import";
import mapFunctionNode from "./map-function";
import { bootstrapClosure } from "./closure";
import { parseGlobalDeclaration } from "./map-function/declaration";
import mapStructNode from "./map-struct";
import hasNode from "../utils/has-node";
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
    ast = { ...ast, params: [...bootstrapClosure(), ...ast.params] };
  }
  // Types have to be pre-parsed before the rest of the program
  walkNode({
    [Syntax.Typedef]: node => {
      types[node.value] = node;
    },
  })(ast);

  const patched = mapNode({
    [Syntax.Typedef]: (_, __) => _,
    // Read Import node, attach indexes if non-scalar
    [Syntax.Import]: mapImport({ functions, types }),
    [Syntax.Declaration]: parseGlobalDeclaration(false, { globals }),
    [Syntax.ImmutableDeclaration]: parseGlobalDeclaration(true, { globals }),
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
  })(ast);

  return {
    ...patched,
    params: [...hoistImports, ...patched.params, ...hoist],
  };
}
