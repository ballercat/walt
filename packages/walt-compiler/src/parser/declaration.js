// @flow
import Syntax from 'walt-syntax';
import expression from './expression';
import type Context from './context';
import type { NodeType } from '../flow/types';

const declaration = (ctx: Context): NodeType => {
  const node = ctx.startNode();
  let Type = Syntax.Declaration;

  if (ctx.token.value === 'const') {
    Type = Syntax.ImmutableDeclaration;
  }

  ctx.eat(['const', 'let', 'function']);

  node.value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect([':']);

  let type = ctx.token.value;

  if (!ctx.eat(null, Syntax.Type)) {
    ctx.expect(null, Syntax.Identifier);
  }

  const params = [];
  // Parse generic
  if (ctx.eat(['<'])) {
    ctx.eat(['{']);
    params.push(expression(ctx));
    ctx.eat(['}']);
    ctx.eat(['>']);
  } else if (ctx.eat(['='])) {
    params.push(expression(ctx));
  }

  return ctx.endNode({ ...node, params, type }, Type);
};

export default declaration;
