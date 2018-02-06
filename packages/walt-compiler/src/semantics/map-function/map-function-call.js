// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import { expandClosureIdentifier } from "../closure";
import {
  funcIndex as setMetaFunctionIndex,
  typeIndex as setMetaTypeIndex,
  get,
  CLOSURE_TYPE,
} from "../metadata";

export default curry(function mapFunctonCall(options, call) {
  const { functions, types, locals, mapIdentifier, mapSizeof } = options;

  // sizeof(<target>) calls
  if (call.value === "sizeof") {
    return mapSizeof(call);
  }

  // Regular function calls
  if (functions[call.value] != null) {
    const index = Object.keys(functions).indexOf(call.value);
    return {
      ...call,
      type: functions[call.value].type,
      meta: [setMetaFunctionIndex(index)],
    };
  }

  // Function pointer calls aka indirect calls
  if (locals[call.value] != null) {
    // Closures are a special case of indirect function calls where a 64-bit
    // variable is used to encode both the function index and the memory pointer.
    const identifier = {
      ...mapIdentifier(call),
      Type: Syntax.Identifier,
    };
    const meta = [...identifier.meta];

    // Expand the 64-bit identifier into an additional 32-bit argument for closure
    // base pointer and table index.
    if (get(CLOSURE_TYPE, identifier) != null) {
      return {
        ...call,
        meta,
        Type: Syntax.IndirectFunctionCall,
        params: [...expandClosureIdentifier(identifier)],
      };
    }

    const typeIndex = Object.keys(types).indexOf(identifier.type);
    meta.push(setMetaTypeIndex(typeIndex));
    const type = (() => {
      const typedef = types[identifier.type];
      return typedef != null ? typedef.type : call.type;
    })();

    return {
      ...call,
      meta,
      type,
      params: [...call.params, identifier],
      Type: Syntax.IndirectFunctionCall,
    };
  }

  return call;
});
