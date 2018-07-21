// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import { FUNCTION_INDEX, TYPE_ARRAY } from "../metadata";

const mapIdentifier = curry(
  ({ locals, globals, functions, table }, identifier) => {
    // Not a function call or pointer, look-up variables
    const local = locals[identifier.value];
    const global = globals[identifier.value];

    if (identifier.value === "__DATA_LENGTH__") {
      return {
        ...identifier,
        type: "i32",
        Type: Syntax.ArraySubscript,
        params: [
          { ...identifier, type: "i32", value: "0", Type: Syntax.Constant },
          { ...identifier, type: "i32", value: "0", Type: Syntax.Constant },
        ],
      };
    }

    if (local != null) {
      const type = (() => {
        const isArray = local.meta[TYPE_ARRAY];
        return isArray || local.type;
      })();
      return {
        ...identifier,
        type,
        meta: { ...local.meta },
      };
    } else if (global != null) {
      return {
        ...identifier,
        type: globals[identifier.value].type,
        meta: { ...global.meta },
      };
    } else if (functions[identifier.value] != null) {
      if (table[identifier.value] == null) {
        table[identifier.value] = functions[identifier.value];
      }
      return {
        ...identifier,
        type: "i32",
        meta: {
          [FUNCTION_INDEX]: Object.keys(functions).indexOf(identifier.value),
        },
        value: Object.keys(table).indexOf(identifier.value),
        Type: Syntax.FunctionPointer,
      };
    }

    return identifier;
  }
);

export default mapIdentifier;
