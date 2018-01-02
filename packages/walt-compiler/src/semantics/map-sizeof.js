// @flow
import invariant from "invariant";
import curry from "curry";
import Syntax from "../Syntax";
import type { NodeType } from "../flow/types";
import { get, OBJECT_SIZE } from "../semantics/metadata";

const variableSize = (node: NodeType): string => {
  switch (node.type) {
    case "i64":
    case "f64":
      return "8";
    case "i32":
    case "f32":
    default:
      return "4";
  }
};

const mapSizeof = curry(({ locals, globals, functions, userTypes }, sizeof) => {
  // Not a function call or pointer, look-up variables
  const local = locals[sizeof.value];
  const global = globals[sizeof.value];
  const userType =
    userTypes[sizeof.value] || (local ? userTypes[local.type] : null);
  const func = functions[sizeof.value];

  if (userType) {
    const metaSize = get(OBJECT_SIZE, userType);
    invariant(metaSize, "Object size information is missing");
    return {
      ...sizeof,
      value: metaSize.payload,
      Type: Syntax.Constant,
    };
  }

  return {
    ...sizeof,
    value: variableSize(local || global || userType || func),
    Type: Syntax.Constant,
  };
});

export default mapSizeof;
