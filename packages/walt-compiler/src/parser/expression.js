// @flow
/**
 * The expression parser for generating all parsed nodes, uses a modified Shunting
 * Yard algo.
 *
 * @author Arthur Buldauksas <arthurbuldauskas@gmail.com>
 */
import Syntax from "../Syntax";
import operator from "./operator";
import constant from "./constant";
import stringLiteral from "./string-literal";
import builtInType from "./builtin-type";
import block from "./block";
import { getAssociativty, getPrecedence } from "./introspection";
import maybeIdentifier from "./maybe-identifier";
import type Context from "./context";
import type { NodeType, TokenType } from "../flow/types";

export type Predicate = (TokenType, number) => boolean;
export type OperatorCheck = TokenType => boolean;

const last = (list: any[]): any => list[list.length - 1];

export const isPunctuatorAndNotBracket = (t: ?TokenType) =>
  t && t.type === Syntax.Punctuator && t.value !== "]" && t.value !== ")";

export const predicate = (token: TokenType, depth: number): boolean =>
  token.value !== ";" && depth > 0;

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
    let prev = last(operators);
    while (prev && prev.value !== condition) {
      consume();
      prev = last(operators);
    }
  };

  const flushOperators = precedence => {
    let previous = null;
    while (
      (previous = last(operators)) &&
      previous.Type !== Syntax.Sequence &&
      getPrecedence(previous) >= precedence &&
      getAssociativty(previous) === "left"
    ) {
      consume();
    }
  };

  const processPunctuator = () => {
    switch (ctx.token.value) {
      case "=>":
        flushOperators(getPrecedence(ctx.token));
        operators.push(ctx.token);
        ctx.next();
        if (ctx.token.value === "{") {
          operands.push(block(ctx));
        }
        return false;
      case "(":
        depth++;
        operators.push(ctx.token);
        break;
      case "[":
        depth++;
        operators.push(ctx.token);
        break;
      case "]":
        depth--;
        eatUntil("[");
        consume();
        break;
      case ")": {
        depth--;
        if (depth < 1) {
          return false;
        }
        // If we are not in a group already find the last LBracket,
        // consume everything until that point
        eatUntil("(");
        // Pop left bracket
        operators.pop();

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
        eatUntil("{");
        consume();
        break;
      default: {
        const token = (t => {
          if (
            (t.value === "-" && previousToken == null) ||
            (t.value === "-" && isPunctuatorAndNotBracket(previousToken))
          ) {
            return {
              ...t,
              value: "--",
            };
          }

          return t;
        })(ctx.token);

        flushOperators(getPrecedence(token));
        operators.push(token);
      }
    }
  };

  const process = () => {
    switch (ctx.token.type) {
      case Syntax.Keyword:
        operators.push(ctx.token);
        break;
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
      case Syntax.Punctuator:
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

  while (operators.length) {
    consume();
  }

  // Should be a node
  return operands.pop();
};

export default expression;
