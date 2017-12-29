// @flow
import { get, GLOBAL_INDEX, FUNCTION_INDEX } from "../parser/metadata";
import { EXTERN_GLOBAL, EXTERN_FUNCTION } from "../emitter/external_kind";
import invariant from "invariant";
import type { NodeType } from "./flow/types";

export default function generateExport(
  node: NodeType
): {
  index: number,
  kind: number,
  field: string,
} {
  const functionIndexMeta = get(FUNCTION_INDEX, node);
  const globalIndexMeta = get(GLOBAL_INDEX, node);

  if (globalIndexMeta) {
    return {
      index: globalIndexMeta.payload.index,
      kind: EXTERN_GLOBAL,
      field: node.value,
    };
  }

  if (functionIndexMeta) {
    return {
      get index() {
        return functionIndexMeta.payload.functionIndex;
      },
      kind: EXTERN_FUNCTION,
      field: node.value,
    };
  }

  invariant(false, "Unknown Export");
}
