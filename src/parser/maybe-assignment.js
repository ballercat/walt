import Syntax from '../Syntax';
import maybeIdentifier from './maybe-identifier';
import memoryStore from './memory-store';
import expression from './expression';

// It is easier to parse assignment this way as we need to maintain a valid type
// through out the right-hand side of the expression
function maybeAssignment(ctx) {
  const nextValue = ctx.stream.peek().value;
  if (nextValue === '[')
    return memoryStore(ctx);

  const target = maybeIdentifier(ctx);
  if (target.Type === Syntax.FunctionCall)
    return target;

  const params = [];

  const operator =
    nextValue === '='
    || nextValue === '--'
    || nextValue === '++';

  if (operator) {
    if (nextValue === '=') {
      ctx.eat(null, Syntax.Identifier);
      ctx.eat(['=']);
    }
    const node = ctx.startNode();
    // Push the reference to the local/global
    params.push(target);
    const expr = expression(ctx);
    // not a postfix
    expr.isPostfix = false;
    params.push(expr);

    node.params = params;

    return ctx.endNode(node, Syntax.Assignment);
  }

  return expression(ctx);
}

export default maybeAssignment;

