// @flow
import Syntax from "../Syntax";
import {
  globalIndex as setMetaGlobalIndex,
  localIndex as setMetaLocalIndex,
  tableIndex,
} from "./metadata";
import { writeFunctionPointer } from "./implicit-imports";
import type Context from "./context";
import type { NodeType } from "../flow/types";
import {
  findLocalVariable,
  findGlobalIndex,
  findFunctionIndex,
} from "./introspection";

// Maybe identifier, maybe function call
const maybeIdentifier = (ctx: Context): NodeType => {
  const node = ctx.startNode();
  const local = ctx.func ? findLocalVariable(ctx.func, ctx.token) : null;
  const globalIndex = findGlobalIndex(ctx, ctx.token);
  const functionIndex = findFunctionIndex(ctx, ctx.token);
  const userType = ctx.userTypes[ctx.token.value];

  let Type = Syntax.Identifier;
  // Not a function call or pointer, look-up variables
  if (local != null) {
    node.type = local.node.type;
    node.meta.push(setMetaLocalIndex(local));
  } else if (globalIndex !== -1) {
    node.type = ctx.globals[globalIndex].type;
    node.meta.push(setMetaGlobalIndex(globalIndex));
  } else if (functionIndex !== -1 && ctx.stream.peek().value !== "(") {
    node.type = "i32";
    Type = Syntax.FunctionPointer;
    node.meta.push(tableIndex(writeFunctionPointer(ctx, functionIndex)));
  } else if (userType != null && ctx.stream.peek().value !== "(") {
    node.type = "i32";
    Type = Syntax.UserType;
  } else if (functionIndex === -1) {
    ctx.handleUndefinedIdentifier(ctx.token.value);
  }

  return ctx.endNode(node, Type);
};

export default maybeIdentifier;
