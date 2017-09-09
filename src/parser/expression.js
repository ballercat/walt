import Syntax from '../Syntax';
import operator from './operator';
import constant from './constant';
import precedence from './precedence';
import maybeIdentifier from './maybe-identifier';

const last = list => list[list.length - 1];

const assoc = op => {
  switch(op) {
    case '+':
    case '-':
    case '/':
    case '*':
    case ':':
      return 'left';
    case '=':
    case '--':
    case '++':
    case '?':
      return 'right';
    default:
      return 'left';
  }
};

const isLBracket = op => op && op.value === '(';
const isRBracket = op => op && op.value === ')';
const isTStart = op => op && op.value === '?';
const isTEnd = op => op && op.value === ':';
const hasLBracket = ops => ops.find(isLBracket);

// Simplified version of the Shunting yard algorithm
const expression = (
  ctx,
  type = 'i32',
  inGroup = false,
  associativity = 'right'
) => {
  const operators = [];
  const operands = [];

  const consume = () =>
    operands.push(operator(ctx, { type, operator: operators.pop(), operands }));

  const eatUntil = (predicate) => {
    let prev = last(operators);
    while(prev && !predicate(prev)) {
      consume();
      prev = last(operators);
    }
  };

  ctx.diAssoc = associativity;

  while(ctx.token && ctx.token.value !== ';' && ctx.token.value !== ',') {
    if (ctx.token.type === Syntax.Constant)
      operands.push(constant(ctx));
    else if (ctx.token.type === Syntax.Identifier)
      operands.push(maybeIdentifier(ctx));
    else if (ctx.token.type === Syntax.Punctuator) {
      const op = Object.assign({
        precedence: precedence[ctx.token.value]
      }, ctx.token);

      // Increment, decrement are a bit annoying...
      // we don't know if it's left associative or right without a lot of gymnastics
      if (ctx.token.value === '--' || ctx.token.value === '++') {
        // As we create different nodes the diAssoc is changed
        op.assoc = ctx.diAssoc;
      } else {
        // vanilla binary operator
        op.assoc = assoc(op.value);
      }

      if (isLBracket(op)) {
        operators.push(op);
      } else if (isTEnd(op)) {
        eatUntil(isTStart);
      } else if (isRBracket(op)) {
        if (!inGroup) {
          // If we are not in a group already find the last LBracket,
          // consume everything until that point
          eatUntil(isLBracket);

          // Pop left bracket
          operators.pop();
        } else {
          break;
        }
      } else {
        while(last(operators)
          && last(operators).precedence >= op.precedence
          && last(operators).assoc === 'left'
        ) consume();

        operators.push(op);
      }
    }

    ctx.next();
  };


  while(operators.length)
    consume();

  // Should be a node
  return operands.pop();
}

export default expression;

