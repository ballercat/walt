// @flow
import type Context from './context';
import Syntax from '../Syntax';
import expression from '../parser/expression';
import type { NodeType } from '../flow/types';

export default function builtInType(ctx: Context): NodeType {
  if (ctx.stream.peek().value === '<') {
    const valueType = ctx.token.value;
    ctx.eat(['Memory', 'Table']);
    ctx.eat(['<']);
    ctx.eat(['{']);
    const node = ctx.makeNode(
      {
        value: valueType,
        type: valueType,
        params: [expression(ctx)],
      },
      Syntax.Type
    );
    ctx.eat(['}']);
    return node;
  }

  return ctx.makeNode(
    { value: ctx.token.value, type: ctx.token.value },
    Syntax.Type
  );
}
