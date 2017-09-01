import Syntax from '../Syntax';

function binary(ctx, opts) {
  const node = Object.assign(
    ctx.startNode(opts.operands[0]),
    opts
  );

  ctx.diAssoc = 'left';
  let Type = Syntax.BinaryExpression;
  if (node.operator.value === '=') {
    Type = Syntax.Assignment;
    ctx.diAssoc = 'right';
  }

  return ctx.endNode(node, Type);
}
function unary(ctx, opts) {
  // Since WebAssembly has no 'native' support for incr/decr _opcode_ it's much simpler to
  // convert this unary to a binary expression by throwing in an extra operand of 1
  if (opts.operator.value === '--' || opts.operator.value === '++') {
    // set isPostfix to help the IR generator
    const bopts = Object.assign({ isPostfix: opts.operator.assoc === 'left' }, opts);
    bopts.operator.value = opts.operator.value[0];
    bopts.operands.push({ Type: Syntax.Constant, value: '1' });
    return binary(ctx, bopts);
  }
  const node = Object.assign(
    ctx.startNode(opts.operands[0]),
    opts
  );
  return ctx.endNode(node, Syntax.UnaryExpression);
}

// Abstraction for handling operations
function binaryOrUnary(ctx, type, operator, operands) {
  switch(operator.value) {
    case '++':
    case '--':
      return unary(ctx, { type, operator, operands: operands.splice(-1) });
    default:
      return binary(ctx, { type, operator, operands: operands.splice(-2) });
  }
}

export default binaryOrUnary;

