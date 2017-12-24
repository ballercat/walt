// @flow
import opcode from "../emitter/opcode";
import { get, TABLE_INDEX } from "../parser/metadata";
import invariant from "invariant";
import type { GeneratorType } from "./flow/types";

const generateFunctionPointer: GeneratorType = node => {
  const metaTableIndex = get(TABLE_INDEX, node);
  invariant(
    metaTableIndex,
    `Cannot generate function pointer for node: ${JSON.stringify(node)}`
  );
  return [
    {
      kind: opcode.i32Const,
      params: [metaTableIndex.payload],
    },
  ];
};

export default generateFunctionPointer;
