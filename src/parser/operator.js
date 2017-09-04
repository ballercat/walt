// @flow
import Syntax from '../Syntax';
import Context from './context';

type Operator = {
};

type ParseOptions = {
  type: string,
  operator: any,
  operands: any
};

function binary(ctx: Context, opts: ParseOptions) {
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

function unary(ctx, opts: ParseOptions) {
  // Since WebAssembly has no 'native' support for incr/decr _opcode_ it's much simpler to
  // convert this unary to a binary expression by throwing in an extra operand of 1
  if (opts.operator.value === '--' || opts.operator.value === '++') {
    // set isPostfix to help the IR generator
    const bopts = {
      ...opts,
      isPostfix: opts.operator.assoc === 'left'
    };
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

const ternary = (ctx: Context, options: ParseOptions) => {
  const node = {
    ...ctx.startNode(options.operands[0]),
    ...options
  };
  return ctx.endNode(node, Syntax.TernaryExpression);
};

// Abstraction for handling operations
const operator = (ctx: Context, options: ParseOptions) => {
  switch(options.operator.value) {
    case '++':
    case '--':
      return unary(ctx, { ...options, operands: options.operands.splice(-1) });
    case '?':
      return ternary(ctx, { ...options, operands: options.operands.splice(-3) });
    default:
      return binary(ctx, { ...options, operands: options.operands.splice(-2) });
  }
};

export default operator;

