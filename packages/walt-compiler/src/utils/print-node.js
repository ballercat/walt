// @flow
import walkNode from "./walk-node";
import Syntax from "../Syntax";
import { get, GLOBAL_INDEX } from "../semantics/metadata";
import { opcodeFromOperator, getTypecastOpcode } from "../emitter/opcode";
import type { NodeType } from "../flow/types";

const printNode = (node?: NodeType): string => {
  if (node == null) {
    return "";
  }

  let depth = 0;
  const offsets = [];
  const pieces = [];
  const comments = [];
  const add = (piece, post = 0, pre = 0, comment = "") => {
    depth += pre;
    comments.push(comment);
    pieces.push(piece);
    offsets.push(depth + piece.length);
    depth += post;
  };

  walkNode({
    [Syntax.BinaryExpression]: (n, print) => {
      const op = opcodeFromOperator(n);
      add("(" + op.text, 2);
      n.params.forEach(print);
      add(")", 0, -2);
    },
    [Syntax.ArraySubscript]: (n, print) => {
      add("(i32.add", 2);
      n.params.forEach(print);
      add(")", 0, -2);
    },
    [Syntax.Identifier]: n => {
      const scope = get(GLOBAL_INDEX, n) ? "global" : "local";
      add(`get_${scope} ${n.value}`);
    },
    [Syntax.Constant]: n => {
      add(`${n.type}.const ${n.value}`);
    },
    [Syntax.FunctionDeclaration]: (n, print) => {
      add("(func " + n.value, 2);
      n.params.forEach(print);
      add(")", 0, -2);
    },
    [Syntax.FunctionResult]: n => {
      add("(result " + n.value + ")");
    },
    [Syntax.FunctionArguments]: (n, _print) => {
      if (n.params.length > 0) {
        add("(param", 2);
        n.params.forEach(
          walkNode({
            [Syntax.Pair]: p => add(p.params[0].value + " " + p.params[1].type),
          })
        );
        add(")", 0, -2);
      }
    },
    [Syntax.ReturnStatement]: (n, print) => {
      add("(return", 2);
      n.params.forEach(print);
      add(")", 0, -2);
    },
    [Syntax.Declaration]: (n, print) => {
      add("(local " + n.value + " " + n.type, 2);
      n.params.forEach(print);
      add(")", 0, -2);
    },
    [Syntax.Type]: n => {
      add(n.value);
    },
    [Syntax.TypeCast]: (n, print) => {
      const op = getTypecastOpcode(n.type, n.params[0].type);
      add("(" + op.text, 2);
      n.params.forEach(print);
      add(")", 0, -2);
    },
    [Syntax.ArraySubscript]: (n, print) => {
      add("(" + n.type + ".load", 2, 0);
      n.params.forEach(print);
      add(")", 0, -2);
    },
    [Syntax.MemoryAssignment]: (n, print) => {
      add("(" + n.type + ".store", 2, 0);
      n.params.forEach(print);
      add(")", 0, -2);
    },
  })(node);

  const max = Math.max(...offsets);
  const edge = max + 4;
  const result = pieces.reduce((acc, val, i) => {
    acc +=
      val.padStart(offsets[i], " ").padEnd(edge, " ") +
      ";" +
      comments[i] +
      "\n";
    return acc;
  }, "");

  return result;
};

export default printNode;
