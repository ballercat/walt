// @flow
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import error from "../utils/generate-error";
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
    // All of the validators below need to be implemented
    [Syntax.Struct]: (_, __) => {},
    [Syntax.Import]: (_, __) => {},
    [Syntax.ImmutableDeclaration]: (_, __) => {},
    [Syntax.Declaration]: (_, __) => {},
    [Syntax.FunctionDeclaration]: (_, __) => {},
  })(ast);
}
