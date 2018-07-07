// @flow
import Trie from "../../utils/trie";
import token from "../token";
import Syntax from "../../Syntax";

const supported = [
  "i32",
  "i64",
  "f32",
  "f64",
  "i32[]",
  "i64[]",
  "f32[]",
  "f64[]",
  "u8[]",
  "bool",
  "Function",
  "Memory",
  "Table",
  "void",
];
const trie = new Trie(supported);
export default token(trie.fsearch, Syntax.Type, supported);
