// @flow
import walkNode from "./walk-node";
import Syntax from "../Syntax";
import { get, GLOBAL_INDEX, TYPE_CONST } from "../semantics/metadata";
import { opcodeFromOperator, getTypecastOpcode } from "../emitter/opcode";
import type { NodeType } from "../flow/types";

const getText = (node: NodeType): string => {
  const value = node.value || "??";
  const hasType = node.type;
  const type = hasType || "i32";
  const op = opcodeFromOperator({ value, type });

  if (!hasType) {
    return op.text.replace("i32", "??");
  }

  return op.text;
};

const parseParams = (node: NodeType): string => {
  const params = [];
  walkNode({
    [Syntax.Pair]: (pair, _) => {
      params.push(`${pair.params[0].value} ${pair.params[1].value}`);
    },
    [Syntax.Type]: p => {
      params.push(p.value);
    },
  })(node);
  return params.length ? " param(" + params.join(" ") + ")" : "";
};

const parseResult = (node: ?NodeType): string => {
  if (node == null) {
    return "";
  }
  return " (result " + (node.type || "??") + ")";
};

const typedefString = (node: NodeType): string => {
  const [paramsNode, resultNode] = node.params;
  return (
    "(type " +
    node.value +
    ` (func${parseParams(paramsNode)}${parseResult(resultNode)}))`
  );
};

const getPrinters = add => ({
  [Syntax.Import]: (node, _print) => {
    const [nodes, mod] = node.params;
    walkNode({
      [Syntax.Pair]: ({ params }, _) => {
        const { value: field } = params[0];
        const type = params[1];
        add(`(import "${mod.value}" "${field}" ${typedefString(type)})`);
      },
    })(nodes);
  },
  [Syntax.Export]: (node, print) => {
    add("(export", 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.GenericType]: (node, _print) => {
    add("(type-generic " + node.value + ")", 0, 0, " pseudo type");
  },
  [Syntax.BinaryExpression]: (node: NodeType, print) => {
    const text = getText(node);
    add("(" + text, 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.ArraySubscript]: (node: NodeType, print) => {
    add("(i32.add", 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.Typedef]: (node, _) => {
    add(typedefString(node));
  },
  [Syntax.Identifier]: node => {
    const scope = get(GLOBAL_INDEX, node) ? "global" : "local";
    add(`get_${scope} ${node.value}`);
  },
  [Syntax.Constant]: node => {
    add(`${node.type}.const ${node.value}`);
  },
  [Syntax.FunctionDeclaration]: (node, print) => {
    const [params, result, ...rest] = node.params;
    add(`(func ${node.value}${parseParams(params)}${parseResult(result)}`, 2);

    rest.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.ReturnStatement]: (node, print) => {
    add("(return", 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.Declaration]: (node, print) => {
    const mutability = get(TYPE_CONST, node) ? " immutable" : "mutable";
    add("(local " + node.value + " " + node.type, 2, 0, mutability);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.ImmutableDeclaration]: (node, print) => {
    add("(local " + node.value + " " + node.type, 2, 0, " immutable");
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.Type]: node => {
    add(node.value);
  },
  [Syntax.TypeCast]: (node, print) => {
    const op = getTypecastOpcode(node.type, node.params[0].type);
    add("(" + op.text, 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.ArraySubscript]: (node, print) => {
    add("(" + node.type + ".load", 2, 0);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.MemoryAssignment]: (node, print) => {
    add("(" + node.type + ".store", 2, 0);
    node.params.forEach(print);
    add(")", 0, -2);
  },
});

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

  walkNode(getPrinters(add))(node);

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
