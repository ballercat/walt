// @flow
import Syntax from 'walt-syntax';
import expression from './expression';
import type Context from './context';
import type { NodeType } from '../flow/types';

// Maybe identifier, maybe function call
const maybeIdentifier = (ctx: Context): NodeType => {
  const node = ctx.startNode();
  ctx.eat(null, Syntax.Identifier);

  if (node.value === 'false' || node.value === 'true') {
    node.type = 'bool';
    node.value = node.value === 'true' ? '1' : '0';
    return ctx.endNode(node, Syntax.Constant);
  }

  if (ctx.eat(['('])) {
    const params = [expression(ctx)];
    const functionCall = ctx.endNode(
      {
        ...node,
        params: params.filter(Boolean),
      },
      Syntax.FunctionCall
    );
    ctx.expect([')']);
    return functionCall;
  }

  return ctx.endNode(node, Syntax.Identifier);
};

export default maybeIdentifier;
