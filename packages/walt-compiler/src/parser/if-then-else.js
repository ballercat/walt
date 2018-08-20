// @flow
import Syntax from 'walt-syntax';
import statement from './statement';
import expression from './expression';
import type Context from './context';
import type { NodeType } from '../flow/types';

const condition = (ctx: Context): NodeType => {
  ctx.expect(['(']);
  const expr = expression(ctx);
  ctx.expect([')']);
  return expr;
};

export default function parseIfStatement(ctx: Context): NodeType {
  const node: NodeType = {
    ...ctx.startNode(ctx.token),
  };

  ctx.eat(['if']);
  // First operand is the expression
  const params: NodeType[] = [condition(ctx)];
  const statementNode = statement(ctx);
  if (statementNode) {
    params.push(statementNode);
  }

  ctx.eat([';']);
  while (ctx.eat(['else'])) {
    // maybe another if statement
    const elseNode = ctx.makeNode(null, Syntax.Else);
    const elseParams = [];
    const stmt = statement(ctx);
    if (stmt) {
      elseParams.push(stmt);
    }
    params.push({ ...elseNode, params: elseParams });
  }

  return ctx.endNode(
    {
      ...node,
      params,
    },
    Syntax.IfThenElse
  );
}
