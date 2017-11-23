import { get, GLOBAL_INDEX, FUNCTION_INDEX } from "../parser/metadata";
import { EXTERN_GLOBAL, EXTERN_FUNCTION } from "../emitter/external_kind";
import invariant from "invariant";

export const generateExport = node => {
  if (node && !node.func && node.params.length) {
    return {
      index: get(GLOBAL_INDEX, node).payload,
      kind: EXTERN_GLOBAL,
      field: node.id
    };
  }

  if (node && node.func) {
    return {
      get index() {
        return get(FUNCTION_INDEX, node).payload.functionIndex;
      },
      kind: EXTERN_FUNCTION,
      field: node.id
    };
  }

  invariant(false, "Unknown Export");
};

export default generateExport;
