import Syntax from '../Syntax';
import expression from './expression';

const argumentList = (ctx) => {
  const list = [];
  ctx.expect(['(']);
  while(ctx.token.value !== ')')
    list.push(argument(ctx));
  // ctx.expect([')']);
  return list;
}

const argument = (ctx) => {
  const node = expression(ctx);
  ctx.eat([',']);
  return node;
}
const functionCall = (ctx) => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax.Identifier).value;
  node.functionIndex = ctx.functions.findIndex(({ id }) => id == node.id);
  if (node.functionIndex === -1)
    throw ctx.syntaxError(`Undefined function ${node.id}`);

  node.arguments = argumentList(ctx);

  return ctx.endNode(node, Syntax.FunctionCall);
}

export default functionCall;

