import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import opcode from "../emitter/opcode";

const generateLoop = (node, parent) => {
  const block = [];
  const mapper = mapSyntax(parent);
  const reverse = {
    ">": "<",
    "<": ">",
    ">=": "<=",
    "<=": ">=",
    "==": "!=",
    "!=": "=="
  };

  const condition = node.params.slice(1, 2);
  condition[0].value = reverse[condition[0].value];
  const expression = node.params.slice(2, 3);

  block.push({ kind: opcode.Block, params: [0x40] });
  block.push({ kind: opcode.Loop, params: [0x40] });

  block.push.apply(block, condition.map(mapper).reduce(mergeBlock, []));
  block.push({ kind: opcode.BrIf, params: [1] });

  block.push.apply(block, node.body.map(mapper).reduce(mergeBlock, []));

  block.push.apply(block, expression.map(mapper).reduce(mergeBlock, []));
  block.push({ kind: opcode.Br, params: [0] });

  block.push({ kind: opcode.End });
  block.push({ kind: opcode.End });

  return block;
};

export default generateLoop;
