// @flow
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import opcode from "../emitter/opcode";
import type { GeneratorType } from "./flow/types";

// probably should be called "generateBranch" and be more generic
// like handling ternary for example. A lot of shared logic here & ternary
const generateIf: GeneratorType = (node, parent) => {
  const mapper = mapSyntax(parent);
  const block = [];
  if (node.expr) {
    block.push.apply(block, [node.expr].map(mapper).reduce(mergeBlock, []));
  }

  block.push({
    kind: opcode.If,
    // if-then-else blocks have no return value and the Wasm spec requires us to
    // provide a literal byte '0x40' for "empty block" in these cases
    params: [0x40],
  });

  // after the expression is on the stack and opcode is following it we can write the
  // implicit 'then' block
  block.push.apply(block, (node.then || []).map(mapper).reduce(mergeBlock, []));

  // fllowed by the optional 'else'
  if (node.else != null && node.else.length > 0) {
    block.push({ kind: opcode.Else, params: [] });
    block.push.apply(
      block,
      (node.else || []).map(mapper).reduce(mergeBlock, [])
    );
  }

  block.push({ kind: opcode.End, params: [] });
  return block;
};

export default generateIf;
