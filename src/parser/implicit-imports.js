// @flow
import Syntax from "../Syntax";
import generateElement from "../generator/element";
import generateImport from "../generator/import";
import type Context from "./context";

export const writeFunctionPointer = (
  ctx: Context,
  functionIndex: number,
): boolean => {
  if (!ctx.Program.Element.length) {
    ctx.Program.Imports.push.apply(
      ctx.Program.Imports,
      generateImport({
        Type: Syntax.Import,
        value: "import",
        range: [],
        meta: [],
        type: null,
        params: [
          {
            Type: Syntax.Pair,
            value: ":",
            meta: [],
            range: [],
            type: null,
            params: [
              {
                Type: Syntax.Identifier,
                value: "table",
                params: [],
                meta: [],
                range: [],
                type: null,
              },
              {
                Type: Syntax.Identifier,
                value: "Table",
                params: [],
                meta: [],
                range: [],
                type: null,
              },
            ],
          },

          {
            value: "env",
            Type: Syntax.Identifier,
            meta: [],
            params: [],
            range: [],
            type: null,
          },
        ],
      }),
    );
  }

  const exists = ctx.Program.Element.findIndex(
    n => n.functionIndex === functionIndex,
  );
  if (exists < 0) {
    ctx.Program.Element.push(generateElement(functionIndex));
    return Boolean(ctx.Program.Element.length - 1);
  }

  return exists;
};
