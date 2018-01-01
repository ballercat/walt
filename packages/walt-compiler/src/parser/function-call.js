// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import { findLocalVariable } from "./introspection";
import type Context from "./context";
import type { Token, NodeType } from "../flow/types";

const functionCall = (ctx: Context, op: Token, operands: NodeType[]) => {
  const node = ctx.startNode(op);
  // If last operand is a sequence that means we have function arguments
  const maybeArguments = operands[operands.length - 1];
  if (maybeArguments && maybeArguments.Type !== Syntax.FunctionIdentifier) {
    node.params = operands.splice(-1);
  }
  const identifier = operands.splice(-1)[0];
  const maybePointer = ctx.func
    ? findLocalVariable(ctx.func, identifier)
    : null;

  node.value = identifier.value;

  if (maybePointer) {
    return ctx.endNode(
      {
        ...node,
        params: [...node.params, identifier],
      },
      Syntax.IndirectFunctionCall
    );
  }

  const Type = Syntax.FunctionCall;
  const func = ctx.functions.find(({ value }) => value === identifier.value);
  if (!func) {
    throw ctx.syntaxError(`Undefined function: ${identifier.value}`);
  }

  node.meta = [...func.meta];

  invariant(func, `Undefined function ${identifier.value}`);

  node.type = func.type;

  return ctx.endNode(node, Type);
};

export default functionCall;
