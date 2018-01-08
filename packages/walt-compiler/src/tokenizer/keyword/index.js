// @flow
import Trie from "../../utils/trie";
import token from "../token";
import Syntax from "../../Syntax";

const supported = [
  // EcmaScript
  "break",
  "if",
  "else",
  "import",
  "from",
  "export",
  "return",
  "switch",
  "case",
  "default",
  "const",
  "let",
  "for",
  "continue",
  "do",
  "while",

  // walt replacement, matching s-expression syntax
  "function",

  // s-expression
  "global",
  "module",
  "type",
];

export const nosupport = [
  "catch",
  "extends",
  "super",
  // There is no concept of this in wast
  "this",
  "debugger",
  // vars and lets are replaced with types (i32, f32, etc)
  "var",
  // no classes in wast
  "class",
  "try",
  "catch",
  "finally",
  // Everything is statically typed
  "typeof",
];

const trie = new Trie(supported);
const root = trie.fsearch;

export default token(root, Syntax.Keyword, supported);
