// @flow
import Context from "./context";
import {
  EXTERN_TABLE,
  EXTERN_MEMORY,
  EXTERN_FUNCTION
} from "../emitter/external_kind";
import { generateType, generateImport, generateElement } from "./generator";
import { make, FUNCTION_INDEX } from "./metadata";
import Syntax from "../Syntax";

const memoryImport = generateImport({
  module: "env",
  fields: [
    {
      id: "memory",
      kind: EXTERN_MEMORY
    }
  ]
});

export const writeFunctionPointer = (
  ctx: Context,
  functionIndex: number
): void => {
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
    return ctx.Program.Element.length - 1;
  }

  return exists;
};

export const importMemory = (ctx: Context): void => {
  if (!ctx.Program.Imports.find(({ kind }) => kind === EXTERN_MEMORY)) {
    ctx.Program.Imports.push.apply(ctx.Program.Imports, memoryImport);

    const newNode = ctx.makeNode(
      {
        id: "new",
        params: [{ type: "i32", isParam: true }],
        result: "i32",
        // ctx.Program.Types.length
        typeIndex: 1,
        meta: [
          make({ functionIndex: ctx.functionImports.length }, FUNCTION_INDEX)
        ]
      },
      Syntax.FunctionDeclaration
    );

    ctx.Program.Types.push(generateType(newNode));
    ctx.Program.Imports.push.apply(
      ctx.Program.Imports,
      generateImport({
        module: "env",
        fields: [
          {
            id: "new",
            kind: EXTERN_FUNCTION,
            typeIndex: newNode.typeIndex
          }
        ]
      })
    );
    ctx.Program.Functions.push(null);
    ctx.functionImports.push(newNode);
  }
};
