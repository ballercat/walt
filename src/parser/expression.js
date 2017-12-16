// @flow
import Syntax from "../Syntax";
import operator from "./operator";
import constant from "./constant";
import stringLiteral from "./string-literal";
import builtInType from "./builtin-type";
import { getAssociativty, getPrecedence } from "./introspection";
import maybeIdentifier from "./maybe-identifier";
import { PRECEDENCE_FUNCTION_CALL } from "./precedence";
import type Context from "./context";
import type { Node, Token } from "../flow/types";

export type Predicate = (Token, number) => boolean;
export type OperatorCheck = Token => boolean;

const last = (list: any[]): any => list[list.length - 1];

const valueIs = (v: string) => (o: Token): boolean => o.value === v;

const isLBracket = valueIs("(");
const isLSqrBracket = valueIs("[");
const isTStart = valueIs("?");
const isBlockStart = valueIs("{");
export const isPunctuatorAndNotBracket = (t: ?Token) =>
  t && t.type === Syntax.Punctuator && t.value !== "]" && t.value !== ")";

export const predicate = (token: Token, depth: number): boolean =>
  token.value !== ";" && depth > 0;

// Shunting yard
const expression = (
  ctx: Context,
  type: string = "i32",
  check: Predicate = predicate
) => {
  const operators: Token[] = [];
  const operands: Node[] = [];
  // Depth is the nesting level of brackets in this expression. If we find a
  // closing bracket which causes our depth to fall below 1, then we know we
  // should exit the expression.
  let depth: number = 1;
  let eatFunctionCall = false;
  let inTernary = false;
  let previousToken = null;

  const consume = () => operands.push(operator(ctx, operators, operands));

  const eatUntil = condition => {
    let prev = last(operators);
    while (prev && !condition(prev)) {
      consume();
      prev = last(operators);
    }
  };

  const flushOperators = (precedence, value) => {
    let previous = null;
    while (
      (previous = last(operators)) &&
      previous.Type !== Syntax.Sequence &&
      getPrecedence(previous) >= precedence &&
      getAssociativty(previous) === "left"
    ) {
      if (value === "," && previous.type === Syntax.FunctionCall) break;
      // if (value === ":" && previous.type === Syntax.Pair) break;
      consume();
    }
  };

  const processPunctuator = () => {
    switch (ctx.token.value) {
      case "(":
        depth++;
        // Function call.
        // TODO: figure out a cleaner(?) way of doing this, maybe
        if (eatFunctionCall) {
          // definetly not immutable
          last(operands).Type = Syntax.FunctionIdentifier;
          flushOperators(PRECEDENCE_FUNCTION_CALL);
          // Tokenizer does not generate function call tokens it is our job here
          // to generate a function call on the fly
          operators.push({
            ...ctx.token,
            type: Syntax.FunctionCall
          });
          ctx.next();
          const expr = expression(ctx);
          if (expr) {
            operands.push(expr);
          }
          return false;
        } else {
          if (ctx.token.value === "?") {
            inTernary = true;
          }
          operators.push(ctx.token);
        }
        break;
      case "[":
        depth++;
        operators.push(ctx.token);
        break;
      case "]":
        depth--;
        eatUntil(isLSqrBracket);
        consume();
        break;
      case ")": {
        depth--;
        if (depth < 1) {
          return false;
        }
        // If we are not in a group already find the last LBracket,
        // consume everything until that point
        eatUntil(isLBracket);
        const previous = last(operators);
        if (previous && previous.type === Syntax.FunctionCall) {
          consume();
        } else if (depth > 0) {
          // Pop left bracket
          operators.pop();
        }

        break;
      }
      case "{":
        depth++;
        operators.push(ctx.token);
        break;
      case "}":
        depth--;
        if (depth < 1) {
          return false;
        }
        eatUntil(isBlockStart);
        consume();
        break;
      default: {
        if (ctx.token.value === ":" && inTernary) {
          eatUntil(isTStart);
          inTernary = false;
          break;
        }

        const token = (t => {
          if (
            (t.value === "-" && previousToken == null) ||
            (t.value === "-" && isPunctuatorAndNotBracket(previousToken))
          ) {
            return {
              ...t,
              value: "--"
            };
          }

          return t;
        })(ctx.token);

        flushOperators(getPrecedence(token), token.value);
        operators.push(token);
      }
    }
  };

  const process = () => {
    switch (ctx.token.type) {
      case Syntax.Constant:
        eatFunctionCall = false;
        operands.push(constant(ctx));
        break;
      case Syntax.Identifier:
        eatFunctionCall = true;
        operands.push(maybeIdentifier(ctx));
        break;
      case Syntax.StringLiteral:
        eatFunctionCall = false;
        operands.push(stringLiteral(ctx));
        break;
      case Syntax.Type:
        eatFunctionCall = false;
        operands.push(builtInType(ctx));
        break;
      case Syntax.UnaryExpression:
        eatFunctionCall = false;
        flushOperators(getPrecedence(ctx.token), ctx.token.value);
        operators.push(ctx.token);
        break;
      case Syntax.Punctuator:
        const punctuatorResult = processPunctuator();
        if (punctuatorResult != null) {
          return punctuatorResult;
        }
        eatFunctionCall = false;
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

  while (operators.length) consume();

  // Should be a node
  return operands.pop();
};

export default expression;
