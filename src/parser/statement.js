// @flow
import Syntax from "../Syntax";
import block from "./block";
import keyword from "./keyword";
import maybeAssignment from "./maybe-assignment";
import type Context from "./context";
import type { NodeType } from "../flow/types";

const statement = (ctx: Context): NodeType | null => {
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
