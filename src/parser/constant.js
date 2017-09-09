import Syntax from '../Syntax';

const constant = (ctx) => {
  const node = ctx.startNode();
  node.value = ctx.token.value;
  return ctx.endNode(node, Syntax.Constant);
};

export default constant;

