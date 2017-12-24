// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import { getType } from "../generator/utils";
import generateType from "../generator/type";
import generateImport from "../generator/import";
import type { Field, Import, NodeType } from "../flow/types";
import { EXTERN_MEMORY } from "../emitter/external_kind";
import { make, FUNCTION_INDEX } from "./metadata";

const field = (ctx: Context): Field => {
  const f: Field = {
    id: ctx.expect(null, Syntax.Identifier).value
  };

  ctx.expect([":"]);
  const typeString: string = ctx.token.value;
  if (ctx.eat(null, Syntax.Type)) {
    // native type, aka GLOBAL export
    if (typeString === "Memory") {
      f.kind = EXTERN_MEMORY;
    } else {
      f.global = getType(typeString);
    }
  } else if (ctx.eat(null, Syntax.Identifier)) {
    // now we need to find a typeIndex, if we don't find one we create one
    // with the idea that a type will be filled in later. if one is not we
    // will throw a SyntaxError when we attempt to emit the binary

    f.typeIndex = ctx.Program.Types.findIndex(({ id }) => id === typeString);
    if (f.typeIndex === -1) {
      f.typeIndex = ctx.Program.Types.length;
      ctx.Program.Types.push({
        id: typeString,
        params: [],
        // When we DO define a type for it later, patch the dummy type
        hoist: (node: NodeType) => {
          ctx.Program.Types[f.typeIndex] = generateType(node);
        }
      });
    }

    // attach to a type index
    const functionIndex = ctx.Program.Functions.length;
    f.meta = [
      make(
        {
          functionIndex
        },
        FUNCTION_INDEX
      )
    ];

    f.functionIndex = functionIndex;

    ctx.Program.Functions.push(null);
    ctx.functions.push(f);
  }

  return f;
};

const fieldList = (ctx: Context): Field[] => {
  const fields: Field[] = [];
  while (ctx.token.value !== "}") {
    const f: Field = field(ctx);
    if (f) {
      fields.push(f);
      ctx.eat([","]);
    }
  }
  ctx.expect(["}"]);

  return fields;
};

const _import = (ctx: Context): Import => {
  const node: Import = (ctx.startNode(): any);
  ctx.eat(["import"]);

  if (!ctx.eat(["{"])) {
    throw ctx.syntaxError("expected {");
  }

  node.fields = fieldList(ctx);
  ctx.expect(["from"]);

  node.module = ctx.expect(null, Syntax.StringLiteral).value;
  // NOTE: string literals contain the starting and ending quote char
  node.module = node.module.substring(1, node.module.length - 1);

  ctx.Program.Imports.push.apply(ctx.Program.Imports, generateImport(node));

  ctx.endNode(node, Syntax.Import);
  return node;
};

export default _import;
