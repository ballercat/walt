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
import { AST_METADATA } from "./metadata";
import type { NodeType } from "../flow/types";

function semantics(ast: NodeType): NodeType {
  const functions: { [string]: NodeType } = {};
  const globals: { [string]: NodeType } = {};
  const types: { [string]: NodeType } = {};
  const userTypes: { [string]: NodeType } = {};
  const table: { [string]: NodeType } = {};
  const hoist: NodeType[] = [];
  const hoistImports: NodeType[] = [];
  const statics: { [string]: null } = {};

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
      debugger;
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

  const patched = mapNode({
    [Syntax.Typedef]: (_, __) => _,
    // Read Import node, attach indexes if non-scalar
    [Syntax.Import]: mapImport({ functions, types, globals }),
    [Syntax.Declaration]: parseGlobalDeclaration(false, { globals, types }),
    [Syntax.ImmutableDeclaration]: parseGlobalDeclaration(true, {
      globals,
      types,
    }),
    [Syntax.CharacterLiteral]: mapCharacterLiteral,
    [Syntax.Struct]: mapStructNode({ userTypes }),
    [Syntax.FunctionDeclaration]: mapFunctionNode({
      hoist,
      hoistImports,
      types,
      globals,
      functions,
      userTypes,
      table,
      statics,
    }),
  })(astWithTypes);

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
