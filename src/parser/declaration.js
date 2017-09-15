import Syntax from '../Syntax';
import { generateInit } from './generator';
import expression from './expression';

const generate = (ctx, node) => {
  if (!ctx.func) {
    node.globalIndex = ctx.Program.Globals.length;
    ctx.Program.Globals.push(generateInit(node));
    ctx.globals.push(node);
  } else {
    node.localIndex = ctx.func.locals.length;
    ctx.func.locals.push(node);
  }
}

const declaration = (ctx) => {
  const node = ctx.startNode();
  node.const = ctx.token.value === 'const';
  if (!ctx.eat(['const', 'let']))
    throw ctx.unexpectedValue(['const', 'let']);

  node.id = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect([':']);

  node.type = ctx.expect(null, Syntax.Type).value;

  if (ctx.eat(['=']))
    node.init = expression(ctx, node.type);

  if (node.const && !node.init)
    throw ctx.syntaxError('Constant value must be initialized');

  generate(ctx, node);

  return ctx.endNode(node, Syntax.Declaration);
}

export default declaration;


