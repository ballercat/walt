// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import {
  TYPE_ARRAY,
  get,
  funcIndex as setMetaFunctionIndex,
} from "../metadata";

const mapIdentifier = curry(
  ({ locals, globals, functions, table, userTypes }, identifier) => {
    // Not a function call or pointer, look-up variables
    const local = locals[identifier.value];
    const global = globals[identifier.value];
    if (local != null) {
      const type = (() => {
        const isArray = get(TYPE_ARRAY, locals[identifier.value]);
        return isArray != null
          ? isArray.payload
          : locals[identifier.value].type;
      })();
      return {
        ...identifier,
        type,
        meta: [...local.meta],
      };
    } else if (global != null) {
      return {
        ...identifier,
        type: globals[identifier.value].type,
        meta: [...global.meta],
      };
    } else if (userTypes[identifier.value] != null) {
      return {
        ...identifier,
        type: "i32",
        Type: Syntax.UserType,
      };
    } else if (functions[identifier.value] != null) {
      if (table[identifier.value] == null) {
        table[identifier.value] = functions[identifier.value];
      }
      return {
        ...identifier,
        type: "i32",
        meta: [
          setMetaFunctionIndex(
            Object.keys(functions).indexOf(identifier.value)
          ),
        ],
        value: Object.keys(table).indexOf(identifier.value),
        Type: Syntax.FunctionPointer,
      };
    }

    return identifier;
  }
);

export default mapIdentifier;
