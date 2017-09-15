import Syntax from '../Syntax';
import expression from './expression';

const argumentList = (ctx, proto) => {
  const list = [];
  // return [];
  ctx.expect(['(']);
  while(ctx.token.value !== ')')
    list.push(argument(ctx, proto));
  // ctx.expect([')']);
  return list;
}

const argument = (ctx, proto) => {
  const node = expression(ctx, proto.type, true);
  ctx.eat([',']);
  return node;
}
const functionCall = (ctx) => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax.Identifier).value;
  node.functionIndex = ctx.functions.findIndex(({ id }) => id == node.id);

  if (node.functionIndex === -1)
    throw ctx.syntaxError(`Undefined function ${node.id}`);

  const proto = ctx.functions[node.functionIndex];

  node.arguments = argumentList(ctx, proto);

  return ctx.endNode(node, Syntax.FunctionCall);
}

export default functionCall;

