// @flow
import Syntax from "../Syntax";
import expression from "./expression";
import metadata from "./metadata";
import type Context from "./context";
import type { NodeType } from "../flow/types";

const declaration = (ctx: Context): NodeType => {
  const node = ctx.startNode();
  let Type = Syntax.Declaration;

  if (ctx.token.value === "const") {
    Type = Syntax.ImmutableDeclaration;
  }

  if (!ctx.eat(["const", "let", "function"])) {
    throw ctx.unexpectedValue(["const", "let", "function"]);
  }

  node.value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect([":"]);

  const userType = ctx.userTypes[ctx.token.value];
  if (userType != null) {
    node.type = "i32";
    node.meta.push(metadata.userType(userType));
    // Eat the identifier for the user defined type
    ctx.eat(null, Syntax.Identifier);
  } else {
    node.type = ctx.expect(null, Syntax.Type).value;
  }

  if (ctx.eat(["["]) && ctx.eat(["]"])) {
    node.meta.push(metadata.array(node.type));
    node.type = "i32";
  }

  if (ctx.eat(["="])) {
    node.params.push(expression(ctx));
  }

  if (node.const && !node.init) {
    throw ctx.syntaxError("Constant value must be initialized");
  }

  return ctx.endNode(node, Type);
};

export default declaration;
