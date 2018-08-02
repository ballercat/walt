import { mapImport } from "../semantics/map-import";
import mapFunctionNode from "../semantics/map-function";
import mapStructNode from "../semantics/map-struct";
import mapCharacterLiteral from "../semantics/map-char";
import { parseGlobalDeclaration } from "../semantics/map-function/declaration";

// Core plugin
export default function core() {
  return {
    semantics(options) {
      return {
        Typedef: _ => ({ node }) => node,
        // Read Import node, attach indexes if non-scalar
        Import: _ => mapImport(options),
        Declaration: next => ({ node }) =>
          next(parseGlobalDeclaration(false, options, node)),
        ImmutableDeclaration: next => ({ node }) =>
          next(parseGlobalDeclaration(true, options, node)),
        CharacterLiteral: next => ({ node }) => next(mapCharacterLiteral(node)),
        Struct: _ => mapStructNode(options),
        FunctionDeclaration: _ => mapFunctionNode(options),
      };
    },
  };
}
