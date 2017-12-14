import Syntax from "../Syntax";
import { generateImplicitFunctionType } from "../generator/type";
import generateCode from "../generator";
import { findTypeIndex } from "./introspection";
import statement from "./statement";
import declaration from "./declaration";
import { findUserTypeIndex } from "./introspection";
import metadata, { make, FUNCTION_INDEX } from "./metadata";

const last = list => list[list.length - 1];

const param = ctx => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect([":"]);

  // maybe a custom type
  const { value } = ctx.token;
  if (ctx.eat(null, Syntax.Identifier)) {
    // find the type
    const typePointer = ctx.Program.Types.find(({ id }) => id === value);
    const userType = ctx.userTypes[findUserTypeIndex(ctx, { value })];
    if (userType) {
      node.meta.push(metadata.userType(userType));
    }
    if (typePointer == null && !userType) {
      throw ctx.syntaxError("Undefined Type", value);
    }

    node.typePointer = typePointer;
    node.type = "i32";
  } else {
    node.type = ctx.expect(null, Syntax.Type).value;
  }

  node.isParam = true;

  ctx.eat([","]);
  return ctx.endNode(node, Syntax.Param);
};

const paramList = ctx => {
  const list = [];
  ctx.expect(["("]);
  while (ctx.token.value !== ")") {
    list.push(param(ctx));
  }
  ctx.expect([")"]);
  return list;
};

const maybeFunctionDeclaration = ctx => {
  const node = ctx.startNode();
  if (!ctx.eat(["function"])) return declaration(ctx);

  ctx.func = node;
  node.func = true;
  node.id = ctx.expect(null, Syntax.Identifier).value;
  node.params = paramList(ctx);
  node.locals = [...node.params];

  if (ctx.eat([":"])) {
    node.result = ctx.expect(null, Syntax.Type).value;
    node.result = node.result === "void" ? null : node.result;
  } else {
    node.result = null;
  }

  // NOTE: We need to write function into Program BEFORE
  // we parse the body as the body may refer to the function
  // itself recursively
  // Either re-use an existing type or write a new one
  const typeIndex = findTypeIndex(node, ctx);
  if (typeIndex !== -1) {
    node.typeIndex = typeIndex;
  } else {
    // attach to a type index
    node.typeIndex = ctx.Program.Types.length;
    ctx.Program.Types.push(generateImplicitFunctionType(node));
  }

  node.meta = [
    make(
      {
        get functionIndex() {
          return node.functionIndex + ctx.functionImports.length;
        }
      },
      FUNCTION_INDEX
    )
  ];
  node.functionIndex = ctx.Program.Functions.length;
  ctx.Program.Functions.push(node.typeIndex);
  ctx.functions.push(node);

  ctx.expect(["{"]);
  node.body = [];
  let stmt = null;
  while (ctx.token && ctx.token.value !== "}") {
    stmt = statement(ctx);
    if (stmt) node.body.push(stmt);
  }

  // Sanity check the return statement
  const ret = last(node.params);
  if (ret && node.type) {
    if (node.type === "void" && ret.Type === Syntax.ReturnStatement)
      throw ctx.syntaxError(
        "Unexpected return value in a function with result : void"
      );
    if (node.type !== "void" && ret.Type !== Syntax.ReturnStatement)
      throw ctx.syntaxError(
        "Expected a return value in a function with result : " + node.result
      );
  } else if (node.result) {
    // throw ctx.syntaxError(`Return type expected ${node.result}, received ${JSON.stringify(ret)}`);
  }

  // generate the code block for the emiter
  //
  ctx.Program.Code.push(generateCode(node));

  ctx.expect(["}"]);
  ctx.func = null;

  return ctx.endNode(node, Syntax.FunctionDeclaration);
};

export default maybeFunctionDeclaration;
