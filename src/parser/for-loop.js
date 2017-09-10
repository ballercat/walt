//@flow
import Syntax from '../Syntax';
import Context from './context';
import expression from './expression';
import statement from './statement';
import type { Node } from '../flow/types';

const paramList = (ctx: Context): Node[] => {
  ctx.expect(['(']);
  const params: Node[] = [];
  let node = null;
  while(ctx.token.value && ctx.token.value !== ')') {
    node = expression(ctx, 'i32', true);
    if (node) {
      params.push(node);
      ctx.eat([';']);
    }
  }

  ctx.expect([')']);
  return params;
}

const forLoop = (ctx: Context): Node => {
  const node = ctx.startNode();
  ctx.eat(['for']);

  node.params = paramList(ctx);

  ctx.expect(['{']);

  node.body = [];
  let stmt = null;
  while(ctx.token && ctx.token.value !== '}') {
    stmt = statement(ctx);
    if (stmt)
      node.body.push(stmt);
  }
  ctx.expect(['}']);

  return ctx.endNode(node, Syntax.Loop);
}

export default forLoop;

