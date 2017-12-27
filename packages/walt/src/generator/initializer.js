// @flow
import Syntax from "../Syntax";
import { generateValueType } from "./utils";
import { I32, I64, F32, F64 } from "../emitter/value_type";
import type { NodeType, IntermediateVariableType } from "./flow/types";

const generateInit = (node: NodeType): IntermediateVariableType => {
  const _global = generateValueType(node);
  if (node.params.length > 0) {
    const { Type, value } = node.params[0];
    if (Type === Syntax.Constant) {
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
    }
  }

  return _global;
};

export default generateInit;
