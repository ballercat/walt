import Syntax from "../Syntax";

const constant = ctx => {
  const node = ctx.startNode();
  const value = ctx.token.value;
  if (value.toString().indexOf(".") !== -1) node.type = "f32";
  else node.type = "i32";
  node.value = value;
  return ctx.endNode(node, Syntax.Constant);
};

export default constant;
