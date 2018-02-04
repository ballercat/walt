// @flow
import Syntax from "../Syntax";
import operator from "./operator";
import constant from "./constant";
import stringLiteral from "./string-literal";
import builtInType from "./builtin-type";
import block from "./block";
import { getAssociativty, getPrecedence } from "./introspection";
import maybeIdentifier from "./maybe-identifier";
import { PRECEDENCE_FUNCTION_CALL } from "./precedence";
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
  let eatFunctionCall = false;
  let previousToken = null;

  const consume = () => operands.push(operator(ctx, operators, operands));

  const eatUntil = condition => {
    let prev = last(operators);
    while (prev && prev.value !== condition) {
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
      if (value === "," && previous.type === Syntax.FunctionCall) {
        break;
      }
      consume();
    }
  };

  const processPunctuator = () => {
    switch (ctx.token.value) {
      case "=>":
        flushOperators(getPrecedence(ctx.token), ctx.token.value);
        operators.push(ctx.token);
        ctx.next();
        if (ctx.token.value === "{") {
          operands.push(block(ctx));
        }
        return false;
      case "(":
        depth++;
        // Function call.
        // TODO: figure out a cleaner(?) way of doing this, maybe
        if (false && eatFunctionCall) {
          // definetly not immutable
          flushOperators(PRECEDENCE_FUNCTION_CALL);
          // Tokenizer does not generate function call tokens it is our job here
          // to generate a function call on the fly
          operators.push({
            ...ctx.token,
            type: Syntax.FunctionCall,
          });
          ctx.next();
          const expr = expression(ctx);
          if (expr) {
            operands.push(expr);
          }
          return false;
        }

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
        previousToken = ctx.token;
        const node = maybeIdentifier(ctx);
        if (node.Type === Syntax.FunctionCall) {
          // flushOperators(PRECEDENCE_FUNCTION_CALL);
        }
        operands.push(node);
        // ctx.next();
        return false;
      case Syntax.StringLiteral:
        eatFunctionCall = false;
        operands.push(stringLiteral(ctx));
        break;
      case Syntax.Type:
        eatFunctionCall = false;
        operands.push(builtInType(ctx));
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

  while (operators.length) {
    consume();
  }

  // Should be a node
  return operands.pop();
};

export default expression;
