// @flow
import Syntax from '../Syntax';
import Context, { findTypeIndex } from './context';
import type { Typed, TypeNode } from './node';
import { generateType } from './generator';

const param = (ctx: Context): Typed | null => {
  const type = ctx.expect(null, Syntax.Type).value;
  if (type === 'void') return null;
  return { type };
}

const params = (ctx: Context): Typed[] => {
  const list: Typed[] = [];
  let type;
  ctx.expect(['(']);
  while(ctx.token && ctx.token.value !== ')') {
    type = param(ctx);
    if (type)
      list.push(type);
    ctx.eat([',']);
  }
  ctx.expect([')']);

  return list;
}

const type = (ctx: Context): TypeNode => {
  const node: TypeNode = (ctx.startNode(): any);

  ctx.eat(['type']);

  node.id = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect(['=']);
  node.params = params(ctx);
  ctx.expect(['=>']);
  node.result = param(ctx);

  // At this point we may have found a type which needs to hoist
  const needsHoisting = ctx.Program.Types.find(({ id, hoist }) => id === node.id && hoist);
  if (needsHoisting) {
    needsHoisting.hoist(node);
  } else {
    ctx.Program.Types.push(generateType(node));
  }

  return ctx.endNode(node, Syntax.Typedef);
}

export default type;

