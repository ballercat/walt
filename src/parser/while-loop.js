//@flow
import Syntax from '../Syntax';
import Context from './context';
import expression from './expression';
import statement from './statement';
import type { Node } from '../flow/types';

const whileLoop = (ctx: Context): Node => {
  const node = ctx.startNode();
  ctx.eat(['while']);
  ctx.expect(['(']);

  node.params = [
    null,
    expression(ctx, 'i32', true)
  ];

  ctx.expect([')']);
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

export default whileLoop;

