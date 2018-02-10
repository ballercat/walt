// @flow
import { generateValueType } from "./utils";
import { I32, I64, F32, F64 } from "../emitter/value_type";
import type { NodeType, IntermediateVariableType } from "./flow/types";

const generateInit = (node: NodeType): IntermediateVariableType => {
  const _global = generateValueType(node);
  const { value } = node.params[0];
  switch (_global.type) {
    case F32:
    case F64:
      _global.init = parseFloat(value);
      break;
    case I32:
    case I64:
    default:
      _global.init = parseInt(value);
  }

  return _global;
};

export default generateInit;
