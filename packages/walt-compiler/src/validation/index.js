// @flow
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import error from "../utils/generate-error";
import { isBuiltinType } from "../generator/utils";
import { get, GLOBAL_INDEX, TYPE_CONST } from "../semantics/metadata";

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
  const problems = [];

  walkNode({
    [Syntax.Pair]: pair => {
      const [start, end] = pair.range;
      problems.push(
        error(
          `Unexpected expression ${pair.Type}`,
          "",
          { start, end },
          filename,
          GLOBAL_LABEL
        )
      );
    },
    [Syntax.Export]: _export => {
      const target = _export.params[0];
      const [start, end] = target.range;
      const globalIndex = get(GLOBAL_INDEX, target);
      if (globalIndex != null && !target.params.length) {
        problems.push(
          error(
            "Global exports must have a value",
            "",
            { start, end },
            filename,
            GLOBAL_LABEL
          )
        );
      }
    },
    [Syntax.Import]: (importNode, _) => {
      walkNode({
        [Syntax.Pair]: pair => {
          const type = pair.params[1];
          if (!isBuiltinType(type.value) && types[type.value] == null) {
            const [start, end] = type.range;
            problems.push(
              error(
                `Undefined Type ${type.value}`,
                `Invalid Import. ${type.value} type does not exist`,
                { start, end },
                filename,
                GLOBAL_LABEL
              )
            );
          }
        },
      })(importNode);
    },
    // All of the validators below need to be implemented
    [Syntax.Struct]: (_, __) => {},
    [Syntax.ImmutableDeclaration]: (_, __) => {},
    [Syntax.Declaration]: (_, __) => {},
    [Syntax.FunctionDeclaration]: (func, __) => {
      walkNode({
        [Syntax.Assignment]: node => {
          const [identifier] = node.params;
          const [start, end] = node.range.slice(-2);
          const isConst = get(TYPE_CONST, identifier);
          if (isConst != null) {
            problems.push(
              error(
                `Cannot reassign a const variable ${identifier.value}`,
                "const is a convenience type and cannot be reassigned, use let instead. NOTE: All locals in WebAssembly are mutable.",
                { start, end },
                filename,
                GLOBAL_LABEL
              )
            );
          }
        },
      })(func);
    },
  })(ast);

  const problemCount = problems.length;
  if (problemCount > 0) {
    const errorString = problems.reduce((acc, value, index) => {
      return acc + "\n" + `[${index + 1}] ${value}\n`;
    }, `Cannot generate WebAssembly for ${filename}. ${problemCount} problems.\n`);

    throw new Error(errorString);
  }
}
