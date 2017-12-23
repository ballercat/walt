// @flow
import Syntax from "../Syntax";
import generateInit from "../generator/initializer";
import generateMemory from "../generator/memory";
import expression from "./expression";
import metadata from "./metadata";
import type Context from "./context";
import type { NodeType } from "../flow/types";
import { addFunctionLocal } from "./introspection";

const generate = (ctx, node) => {
  if (!ctx.func) {
    if (node.type === "Memory") {
      ctx.Program.Memory.push(generateMemory(node));
    } else {
      node.meta.push(metadata.globalIndex(ctx.Program.Globals.length));
      ctx.Program.Globals.push(generateInit(node));
      ctx.globals.push(node);
    }
  } else {
    addFunctionLocal(ctx.func, node);
  }
};

const declaration = (ctx: Context): NodeType => {
  const node = ctx.startNode();

  if (ctx.token.value === "const") {
    node.meta.push(metadata.constant());
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

  generate(ctx, node);

  return ctx.endNode(node, Syntax.Declaration);
};

export default declaration;
