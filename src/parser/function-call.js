// @flow
import Syntax from '../Syntax';
import Context from './context';
import expression from './expression';

const argumentList = (ctx: Context, type: string): Node[] => {
  const list: Node[] = [];
  // return [];
  ctx.expect(['(']);
  while(ctx.token.value !== ')')
    list.push(argument(ctx, type));
  // ctx.expect([')']);
  return list;
}

const argument = (ctx, type: string): Node => {
  const node = expression(ctx, type, true);
  ctx.eat([',']);
  return node;
}
const functionCall = (ctx: Context) => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax.Identifier).value;

  const maybePointer = ctx.func.locals.find(l => l.id === node.id);
  const localIndex = ctx.func.locals.findIndex(({ id }) => id === node.id);

  let Type = Syntax.FunctionCall

  if (maybePointer && localIndex > -1) {
    Type = Syntax.IndirectFunctionCall;

    node.params = [
      ctx.endNode({
        range: [],
        localIndex,
        target: ctx.func.locals[localIndex],
        type: ctx.func.locals[localIndex].type
      }, Syntax.Identifier)
    ];
  } else {
    node.functionIndex = ctx.functions.findIndex(({ id }) => id == node.id);

    if (node.functionIndex === -1)
      throw ctx.syntaxError(`Undefined function: ${node.id}`);
  }

  const proto = ctx.functions[node.functionIndex];

  node.arguments = argumentList(ctx, (proto && proto.type) || 'i32');

  return ctx.endNode(node, Type);
}

export default functionCall;

