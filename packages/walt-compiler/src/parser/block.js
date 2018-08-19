// @flow
import Syntax from 'walt-syntax';
import statement from './statement';
import type Context from './context';
import type { NodeType } from '../flow/types';

export default function blockParser(ctx: Context): NodeType {
  const node = ctx.startNode();
  const params = [];
  if (ctx.eat(['{'])) {
    let stmt;
    while (ctx.token && ctx.token.value !== '}') {
      stmt = statement(ctx);
      if (stmt) {
        params.push(stmt);
      }
    }
    ctx.expect(['}']);
  }

  return ctx.endNode(
    {
      ...node,
      params,
    },
    Syntax.Block
  );
}
