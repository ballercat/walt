//@flow
import Syntax from "../Syntax";
import meta from "./metadata";
import generateElement from "../generator/element";
import type Context from "./context";
import type { Node } from "../flow/types";
import {
  findLocalIndex,
  findGlobalIndex,
  findFunctionIndex,
  findUserTypeIndex,
  findTableIndex
} from "./introspection";

// Maybe identifier, maybe function call
const maybeIdentifier = (ctx: Context): Node => {
  const node = ctx.startNode();
  const localIndex = findLocalIndex(ctx, ctx.token);
  const globalIndex = findGlobalIndex(ctx, ctx.token);
  const functionIndex = findFunctionIndex(ctx, ctx.token);
  const userTypeIndex = findUserTypeIndex(ctx, ctx.token);

  let Type = Syntax.Identifier;
  // Not a function call or pointer, look-up variables
  if (localIndex !== -1) {
    node.type = ctx.func.locals[localIndex].type;
    node.meta.push(meta.localIndex(localIndex));
  } else if (globalIndex !== -1) {
    node.type = ctx.globals[globalIndex].type;
    node.meta.push(meta.globalIndex(globalIndex));
  } else if (functionIndex !== -1 && ctx.stream.peek().value !== "(") {
    node.type = "i32";
    Type = Syntax.FunctionPointer;
    // if (!ctx.Program.Table.length) {
    //   throw ctx.syntaxError(`A table must be defined for function pointers`);
    // }

    let tableIndex = findTableIndex(ctx, functionIndex);
    if (tableIndex < 0) {
      tableIndex = ctx.Program.Element.length;
      ctx.Program.Element.push(generateElement(functionIndex));
    }
    // TODO: make meta an object, sheesh
    node.meta.push(meta.tableIndex(tableIndex));
  } else if (userTypeIndex !== -1 && ctx.stream.peek().value !== "(") {
    node.type = "i32";
    Type = Syntax.Type;
  } else if (functionIndex == -1) {
    throw ctx.syntaxError(`Undefined variable name ${ctx.token.value}`);
  }

  ctx.diAssoc = "left";
  return ctx.endNode(node, Type);
};

export default maybeIdentifier;
