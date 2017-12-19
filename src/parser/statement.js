import Syntax from "../Syntax";
import block from "./block";
import keyword from "./keyword";
import maybeAssignment from "./maybe-assignment";

const statement = ctx => {
  switch (ctx.token.type) {
    case Syntax.Keyword:
      return keyword(ctx);
    case Syntax.Punctuator:
      if (ctx.eat([";"])) {
        return null;
      }
      if (ctx.token.value === "{") {
        return block(ctx);
      }
      throw ctx.syntaxError("Unexpected expression");
    case Syntax.Identifier:
      return maybeAssignment(ctx);
    default:
      throw ctx.unknown(ctx.token);
  }
};

export default statement;
