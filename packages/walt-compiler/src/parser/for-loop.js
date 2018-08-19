// @flow
import Syntax from 'walt-syntax';
import expression from './expression';
import statement from './statement';
import type Context from './context';
import type { NodeType } from '../flow/types';

const paramList = (ctx: Context): NodeType[] => {
  ctx.expect(['(']);
  const params: NodeType[] = [];
  let node = null;
  while (ctx.token.value && ctx.token.value !== ')') {
    node = expression(ctx);
    if (node) {
      params.push(node);
      ctx.eat([';']);
    }
  }

  ctx.expect([')']);
  return params;
};

const forLoop = (ctx: Context): NodeType => {
  const node = ctx.startNode();
  ctx.eat(['for']);

  // Pop the last expression from param list to append to the body of the loop.
  // This is important to do here as it'll be more difficult to acomplish later
  // in the generator accurately. In a for-loop we always want the afterthought
  // to follow the entire body, so here we are.
  const [initializer, condition, afterthought] = paramList(ctx);
  const body = [];

  ctx.expect(['{']);

  let stmt = null;
  while (ctx.token && ctx.token.value !== '}') {
    stmt = statement(ctx);
    if (stmt) {
      body.push(stmt);
    }
  }
  ctx.expect(['}']);

  return ctx.endNode(
    {
      ...node,
      params: [initializer, condition, ...body, afterthought],
    },
    Syntax.Loop
  );
};

export default forLoop;
