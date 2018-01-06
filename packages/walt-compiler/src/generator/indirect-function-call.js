// @flow
import invariant from "invariant";
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import opcode from "../emitter/opcode";
import { get, LOCAL_INDEX, TYPE_INDEX } from "../semantics/metadata";
import type { GeneratorType } from "./flow/types";

const generateIndirectFunctionCall: GeneratorType = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  const localIndex = get(LOCAL_INDEX, node);
  const typeIndexMeta = get(TYPE_INDEX, node);
  invariant(localIndex, "Undefined local index, not a valid function pointer");
  invariant(typeIndexMeta, "Variable is not of a valid function pointer type");

  return [
    ...block,
    {
      kind: opcode.CallIndirect,
      params: [typeIndexMeta.payload, 0],
    },
  ];
};

export default generateIndirectFunctionCall;
