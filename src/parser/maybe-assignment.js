import Syntax from '../Syntax';
import maybeIdentifier from './maybe-identifier';
import expression from './expression';

// It is easier to parse assignment this way as we need to maintain a valid type
// through out the right-hand side of the expression
function maybeAssignment(ctx) {
  const target = maybeIdentifier(ctx);

  const nextValue = ctx.stream.peek().value;
  const operator = nextValue === '=' || nextValue === '--' || nextValue === '++';
  if (operator) {
    if (nextValue === '=') {
      ctx.eat(null, Syntax.Identifier);
      ctx.eat(['=']);
    }
    const assignment = ctx.startNode();
    assignment.operator = { value: '=' };
    // Push the reference to the local/global
    assignment.operands = [target];
    const expr = expression(ctx);
    // not a postfix
    expr.isPostfix = false;
    assignment.operands.push(expr);
    return ctx.endNode(assignment, Syntax.Assignment);
  }

  return expression(ctx);
}

export default maybeAssignment;

