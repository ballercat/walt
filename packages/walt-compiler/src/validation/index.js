// @flow
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import error from "../utils/generate-error";
import { isBuiltinType } from "../generator/utils";
import { get, GLOBAL_INDEX } from "../semantics/metadata";

import type { NodeType } from "../flow/types";

const GLOBAL_LABEL = "global";

export default function validate(
  ast: NodeType,
  {
    filename,
  }: {
    filename: string,
  }
) {
  const [metadata] = ast.meta;
  if (metadata == null) {
    throw new Error("Missing AST metadata!");
  }
  const { types } = metadata.payload;

  walkNode({
    [Syntax.Pair]: pair => {
      const [start, end] = pair.range;
      throw error(
        `Unexpected expression ${pair.Type}`,
        "",
        { start, end },
        filename,
        GLOBAL_LABEL
      );
    },
    [Syntax.Export]: _export => {
      const target = _export.params[0];
      const [start, end] = target.range;
      const globalIndex = get(GLOBAL_INDEX, target);
      if (globalIndex != null && !target.params.length) {
        throw error(
          "Global exports must have a value",
          "",
          { start, end },
          filename,
          GLOBAL_LABEL
        );
      }
    },
    [Syntax.Import]: (importNode, _) => {
      walkNode({
        [Syntax.Pair]: pair => {
          const type = pair.params[1];
          if (!isBuiltinType(type.value) && types[type.value] == null) {
            const [start, end] = type.range;
            throw error(
              `Undefined Type ${type.value}`,
              `Invalid Import. ${type.value} type does not exist`,
              { start, end },
              filename,
              GLOBAL_LABEL
            );
          }
        },
      })(importNode);
    },
    // All of the validators below need to be implemented
    [Syntax.Struct]: (_, __) => {},
    [Syntax.ImmutableDeclaration]: (_, __) => {},
    [Syntax.Declaration]: (_, __) => {},
    [Syntax.FunctionDeclaration]: (_, __) => {},
  })(ast);
}
