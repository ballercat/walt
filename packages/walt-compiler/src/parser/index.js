/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

// @flow
import invariant from 'invariant';
import Syntax, { tokens } from 'walt-syntax';
import moo from 'moo';
// $FlowFixMe
import coreGrammar from './grammar/grammar.ne';
// $FlowFixMe
import defaultArgsGrammar from '../syntax-sugar/default-arguments.ne';
import { Parser, Grammar } from 'nearley';
import helpers from './grammar/helpers';
import nodes from './grammar/nodes';
import type { NodeType } from '../flow/types';

type GrammarType = {
  Lexer: any,
  ParserRules: Object[],
  ParserStart: string,
};
type MakeGrammar = () => GrammarType;

function makeLexer() {
  const mooLexer = moo.compile(tokens);
  // Additional utility on top of the default moo lexer.
  return {
    current: null,
    lines: [],
    get line() {
      return mooLexer.line;
    },
    get col() {
      return mooLexer.col;
    },
    save() {
      return mooLexer.save();
    },
    reset(chunk, info) {
      this.lines = chunk.split('\n');
      return mooLexer.reset(chunk, info);
    },
    next() {
      // It's a cruel and unusual punishment to implement comments with nearly
      let token = mooLexer.next();
      while (token && token.type === 'comment') {
        token = mooLexer.next();
      }
      this.current = token;
      return this.current;
    },
    formatError(token) {
      return mooLexer.formatError(token);
    },
    has(name) {
      return mooLexer.has(name);
    },
  };
}

export default function parse(
  source: string,
  grammarList: MakeGrammar[] = [coreGrammar, defaultArgsGrammar]
): NodeType {
  const context = {
    lexer: makeLexer(),
    nodes,
    helpers,
    Syntax,
  };

  const grammar = grammarList.slice(1).reduce((acc, value) => {
    const extra = value.call(context);
    return {
      ...acc,
      ParserRules: acc.ParserRules.concat(extra.ParserRules),
    };
  }, grammarList[0].call(context));

  const parser = new Parser(Grammar.fromCompiled(grammar));
  parser.feed(source);

  invariant(
    parser.results.length === 1,
    `Ambiguous syntax number of productions: ${parser.results.length}`
  );

  return parser.results[0];
}
