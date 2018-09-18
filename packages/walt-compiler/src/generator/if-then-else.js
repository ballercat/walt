// @flow
import mapSyntax from './map-syntax';
import mergeBlock from './merge-block';
import opcode from '../emitter/opcode';
import type { GeneratorType } from './flow/types';

// probably should be called "generateBranch" and be more generic
// like handling ternary for example. A lot of shared logic here & ternary
const generateIf: GeneratorType = (node, parent) => {
  const mapper = mapSyntax(parent);
  const [condition, thenBlock, ...restParams] = node.params;
  return [
    ...[condition].map(mapper).reduce(mergeBlock, []),
    {
      kind: opcode.If,
      // if-then-else blocks have no return value and the Wasm spec requires us to
      // provide a literal byte '0x40' for "empty block" in these cases
      params: [0x40],
    },

    // after the expression is on the stack and opcode is following it we can write the
    // implicit 'then' block
    ...[thenBlock].map(mapper).reduce(mergeBlock, []),

    // followed by the optional 'else'
    ...restParams.map(mapper).reduce(mergeBlock, []),
    { kind: opcode.End, params: [] },
  ];
};

export default generateIf;
