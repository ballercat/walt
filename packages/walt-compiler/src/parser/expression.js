// @flow
/**
 * The expression parser for generating all parsed nodes, uses a modified Shunting
 * Yard algo.
 *
 * @author Arthur Buldauksas <arthurbuldauskas@gmail.com>
 */
import Syntax from 'walt-syntax';
import operator from './operator';
import constant from './constant';
import stringLiteral from './string-literal';
import builtInType from './builtin-type';
import block from './block';
import { getAssociativty, getPrecedence } from './introspection';
import maybeIdentifier from './maybe-identifier';
import type Context from './context';
import type { NodeType, TokenType } from '../flow/types';

export type Predicate = (TokenType, number) => boolean;
export type OperatorCheck = TokenType => boolean;

// PLEASE READ BEFORE EDITING:
//
// 100% of the program is statements which are made up of expressions. The code
// below is the "engine" to parsing just about everything(useful) in the syntax.
// Take great care editing it.
//
// * Avoid special cases as much as possible.
// * Leverage precednece and other Shunting Yard rules.
// * Simplify whenever possible, avoid adding code.
//
// Thanks.

const last = (list: any[]): any => list[list.length - 1];

export const isPunctuatorAndNotBracket = (t: ?TokenType) =>
  t && t.type === Syntax.Punctuator && t.value !== ']' && t.value !== ')';

// Because expressions can be anywhere and likely nested inside another expression
// this nesting is represented with a depth. If we reach an "exit" like a ) or a }
// and drop our depth below zero we know we have escaped our intended expression
// and we bail out.
export const predicate = (token: TokenType, depth: number): boolean =>
  token.value !== ';' && depth > 0;

// Exceptions to no-keywords-in-expressions
export const validKeywordsInExpressions = ['as'];

// Shunting yard
const expression = (ctx: Context, check: Predicate = predicate) => {
  const operators: TokenType[] = [];
  const operands: NodeType[] = [];

  // Depth is the nesting level of brackets in this expression. If we find a
  // closing bracket which causes our depth to fall below 1, then we know we
  // should exit the expression.
  let depth: number = 1;
  let previousToken = null;

  const consume = () => operands.push(operator(ctx, operators, operands));

  const eatUntil = condition => {
    let previous = last(operators);
    while (previous && previous.value !== condition) {
      consume();
      previous = last(operators);
    }
  };

  // The rules for consuming punctuators(+ - , etc.)
  const flushOperators = precedence => {
    let previous = last(operators);
    while (
      previous &&
      // A sequence is a special case. Note that this is a check for a Sequence NODE.
      // This is so that math operators don't "eat" already parsed sequences of nodes.
      // To put it plainly a comma separated list should never be added to a number.
      // Examples include code like: 1, 2, 3, 2 + 2.
      previous.Type !== Syntax.Sequence &&
      // The rest of this is Shunting Yard rules
      getPrecedence(previous) >= precedence &&
      getAssociativty(previous) === 'left'
    ) {
      consume();
      previous = last(operators);
    }
  };

  // Process individual punctuators, below are the rules for handling things like
  // brackets and code blocks. Other punctuators follow a precedence rule parsing
  // approach.
  const processPunctuator = () => {
    switch (ctx.token.value) {
      case '=>':
        flushOperators(getPrecedence(ctx.token));
        operators.push(ctx.token);
        ctx.next();
        if (ctx.token.value === '{') {
          operands.push(block(ctx));
        }
        return false;
      case '(':
        depth++;
        operators.push(ctx.token);
        break;
      case '[':
        depth++;
        operators.push(ctx.token);
        break;
      case ']':
        depth--;
        eatUntil('[');
        consume();
        break;
      case ')': {
        depth--;
        if (depth < 1) {
          return false;
        }
        // If we are not in a group already find the last LBracket,
        // consume everything until that point
        eatUntil('(');
        // Pop left bracket
        operators.pop();

        break;
      }
      case '{':
        depth++;
        operators.push(ctx.token);
        break;
      case '}':
        depth--;
        if (depth < 1) {
          return false;
        }
        eatUntil('{');
        consume();
        break;
      default: {
        const token = (t => {
          if (
            (t.value === '-' && previousToken == null) ||
            (t.value === '-' && isPunctuatorAndNotBracket(previousToken))
          ) {
            return {
              ...t,
              value: '--',
            };
          }

          return t;
        })(ctx.token);

        flushOperators(getPrecedence(token));
        operators.push(token);
      }
    }
  };

  // Process individual tokens, this will either push to an operand stack or
  // process an operator.
  const process = () => {
    switch (ctx.token.type) {
      case Syntax.Constant:
        operands.push(constant(ctx));
        break;
      case Syntax.Identifier:
        previousToken = ctx.token;
        // Maybe an Identifier or a function call
        operands.push(maybeIdentifier(ctx));
        return false;
      case Syntax.StringLiteral:
        operands.push(stringLiteral(ctx));
        break;
      case Syntax.Type:
        operands.push(builtInType(ctx));
        break;
      case Syntax.Keyword:
      case Syntax.Punctuator:
        // Some special keywords may show up in expressions, but only a small
        // subset. These keywords are treated as punctuators and processed by
        // the overall punctuator rules
        // EXAMPLE: the 'as' keyword - import statements consist of a sequence of
        // expressions but the as keyword can be used to rename an import within.
        if (
          ctx.token.type === Syntax.Keyword &&
          !validKeywordsInExpressions.includes(ctx.token.value)
        ) {
          break;
        }
        const punctuatorResult = processPunctuator();
        if (punctuatorResult != null) {
          return punctuatorResult;
        }
        break;
    }

    return true;
  };

  while (ctx.token && check(ctx.token, depth)) {
    if (process()) {
      previousToken = ctx.token;
      ctx.next();
    }
  }

  // If we get to the end of our available tokens then proceed to eat any left over
  // operators and finalize the expression.
  while (operators.length) {
    consume();
  }

  // Last operand should be a node that is at the "root" of this expression
  return operands.pop();
};

export default expression;
