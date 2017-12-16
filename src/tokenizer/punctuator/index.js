import Trie from "./../../utils/trie";
import token from "../token";
import Syntax from "../../Syntax";

const supported = [
  "+",
  "++",
  "-",
  "--",
  "=",
  "==",
  "+=",
  "-=",
  "=>",
  "<=",
  "!=",
  "%",
  "/",
  "^",
  "&",
  "|",
  "!",
  "**",
  ":",
  "(",
  ")",
  ".",
  "{",
  "}",
  ",",
  "[",
  "]",
  ";",
  ">",
  "<",
  "?"
];

const trie = new Trie(supported);
export default token(trie.fsearch, Syntax.Punctuator, supported);
