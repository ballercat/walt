// @flow
import Context from "./context";
import { EXTERN_TABLE } from "../emitter/external_kind";
import { generateImport, generateElement } from "./generator";

export const writeFunctionPointer = (
  ctx: Context,
  functionIndex: number
): boolean => {
  if (!ctx.Program.Element.length) {
    ctx.Program.Imports.push.apply(
      ctx.Program.Imports,
      generateImport({
        module: "env",
        fields: [
          {
            id: "table",
            kind: EXTERN_TABLE
          }
        ]
      })
    );
  }

  const exists = ctx.Program.Element.findIndex(
    n => n.functionIndex === functionIndex
  );
  if (exists < 0) {
    ctx.Program.Element.push(generateElement(functionIndex));
    return Boolean(ctx.Program.Element.length - 1);
  }

  return exists;
};
