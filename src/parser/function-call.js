// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import type Context from "./context";
import type { Token, Node } from "../flow/types";

const functionCall = (ctx: Context, op: Token, operands: Node[]) => {
  const node = ctx.startNode(op);
  // If last operand is a sequence that means we have function arguments
  const maybeArguments = operands[operands.length - 1];
  if (maybeArguments && maybeArguments.Type !== Syntax.FunctionIdentifier) {
    node.params = operands.splice(-1);
  }

  const identifier = operands.splice(-1)[0];
  const maybePointer = ctx.func.locals.find(l => l.id === identifier.value);
  const localIndex = ctx.func.locals.findIndex(
    ({ id }) => id === identifier.value
  );

  let Type = Syntax.FunctionCall;
  let func = null;

  if (maybePointer && localIndex > -1) {
    Type = Syntax.IndirectFunctionCall;
    func = ctx.functions[identifier.meta[0].payload];
    node.params.push(identifier);
  } else {
    func = ctx.functions.find(({ id }) => id == identifier.value);
    if (!func) {
      throw ctx.syntaxError(`Undefined function: ${identifier.value}`);
    }

    node.meta.push({ ...func.meta[0] });
  }

  invariant(func, `Undefined function ${identifier.value}`);
  node.type = func.result;

  return ctx.endNode(node, Type);
};

export default functionCall;
