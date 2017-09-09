import Syntax from '../Syntax'
import functionCall from './function-call';

// Maybe identifier, maybe function call
const maybeIdentifier = (ctx) => {
  const node = ctx.startNode();
  const localIndex = ctx.func.locals.findIndex(l => l.id === ctx.token.value);
  const globalIndex = ctx.globals.findIndex(g => g.id === ctx.token.value);
  const isFuncitonCall = ctx.stream.peek().value === '(';

  // if function call then encode it as such
  if (isFuncitonCall)
    return functionCall(ctx);

  if (localIndex !== -1) {
    node.localIndex = localIndex;
    node.target = ctx.func.locals[localIndex];
    node.type = node.target.type;
  } else if (globalIndex !== -1) {
    node.globalIndex = globalIndex;
    node.target = ctx.globals[node.globalIndex];
    node.type = node.target.type;
  }

  ctx.diAssoc = 'left';
  return ctx.endNode(node, Syntax.Identifier);
}

export default maybeIdentifier;
