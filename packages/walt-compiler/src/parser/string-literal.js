// @flow
import Syntax from 'walt-syntax';
import type Context from './context';
import type { NodeType } from '../flow/types';

// Note: string literal does not increment the token.
function stringLiteral(ctx: Context): NodeType {
  const node = ctx.startNode();
  node.value = ctx.token.value.substring(1, ctx.token.value.length - 1);

  // Replace escape sequences
  switch (node.value) {
    case '\\b':
      node.value = '\b';
      break;
    case '\\f':
      node.value = '\f';
      break;
    case '\\n':
      node.value = '\n';
      break;
    case '\\r':
      node.value = '\r';
      break;
    case '\\t':
      node.value = '\t';
      break;
    case '\\v':
      node.value = '\v';
      break;
    case '\\0':
      node.value = '\0';
      break;
    case "\\'":
      node.value = "'";
      break;
    case '\\"':
      node.value = '"';
  }

  const Type =
    ctx.token.value[0] === "'" && Array.from(node.value).length === 1
      ? Syntax.CharacterLiteral
      : Syntax.StringLiteral;
  return ctx.endNode(node, Type);
}

export default stringLiteral;
