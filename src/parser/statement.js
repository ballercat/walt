// @flow
import Syntax from '../Syntax';
import keyword from './keyword';
import maybeAssignment from './maybe-assignment';
import Context from './context';

const statement = (ctx: Context) => {
  switch(ctx.token.type) {
    case Syntax.Keyword:
      return keyword(ctx);
    case Syntax.Punctuator:
      if (ctx.eat([';']))
        return null;
      throw ctx.unknown(ctx.token);
    case Syntax.Identifier:
      return maybeAssignment(ctx);
    default:
      throw ctx.unknown(ctx.token);
  }
};

export default statement;

