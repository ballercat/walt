// @flow
import invariant from "invariant";
import curry from "curry";
import Syntax from "../../Syntax";
import { get, OBJECT_SIZE } from "../../semantics/metadata";

const variableSize = (type: string): string => {
  switch (type) {
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
  const [target] = sizeof.params;
  const local = locals[target.value];
  const global = globals[target.value];
  const userType =
    userTypes[target.value] || (local ? userTypes[local.type] : null);
  const func = functions[target.value];

  if (userType != null) {
    const metaSize = get(OBJECT_SIZE, userType);
    invariant(metaSize, "Object size information is missing");
    return {
      ...sizeof,
      value: metaSize,
      params: [],
      type: "i32",
      Type: Syntax.Constant,
    };
  }

  const node = local || global || userType || func;

  return {
    ...sizeof,
    value: variableSize(node ? node.type : target.value),
    type: "i32",
    params: [],
    Type: Syntax.Constant,
  };
});

export default mapSizeof;
