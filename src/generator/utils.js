// @flow
import opcode from "../emitter/opcode";
import curry from "curry";
import invariant from "invariant";
import { I32, F32, F64 } from "../emitter/value_type";
import { get, LOCAL_INDEX, GLOBAL_INDEX, TYPE_CONST } from "../parser/metadata";
import type { IntermediateOpcodeType, RawOpcodeType } from "./flow/types";
import type { NodeType } from "../flow/types";

export const scopeOperation = curry((op, node) => {
  const local = get(LOCAL_INDEX, node);
  const _global = get(GLOBAL_INDEX, node);
  const index = local || _global;

  invariant(
    index,
    `Unefined index for scope Operation. Possibly missing metadata. op: ${JSON.stringify(
      op
    )} node: ${JSON.stringify(node, null, 2)}`
  );

  const kind = local ? op + "Local" : op + "Global";
  const params = [Number(index.payload)];

  return { kind: opcode[kind], params };
});

export const getConstOpcode = (node: NodeType): IntermediateOpcodeType => {
  const nodeType = node.type || "i32";
  const kind: RawOpcodeType = opcode[nodeType + "Const"];
  const params = [Number(node.value)];

  return {
    kind,
    params
  };
};

// clean this up
export const getType = (str: ?string): string => {
  switch (str) {
    case "f32":
      return F32;
    case "f64":
      return F64;
    case "i32":
    case "Function":
    default:
      return I32;
  }
};
export const generateValueType = (
  node: NodeType
): { mutable: number, type: string } => {
  const value = {
    mutable: get(TYPE_CONST, node) ? 0 : 1,
    type: getType(node.type)
  };
  return value;
};
export const setInScope = scopeOperation("Set");
export const getInScope = scopeOperation("Get");
