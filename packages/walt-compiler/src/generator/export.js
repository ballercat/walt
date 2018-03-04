// @flow
import { get, GLOBAL_INDEX, FUNCTION_INDEX } from "../semantics/metadata";
import { EXTERN_GLOBAL, EXTERN_FUNCTION } from "../emitter/external_kind";
import invariant from "invariant";
import type { NodeType, IntermediateExportType } from "./flow/types";

export default function generateExport(node: NodeType): IntermediateExportType {
  const functionIndexMeta = get(FUNCTION_INDEX, node);
  const globalIndexMeta = get(GLOBAL_INDEX, node);

  if (globalIndexMeta != null) {
    return {
      index: globalIndexMeta,
      kind: EXTERN_GLOBAL,
      field: node.value,
    };
  }

  invariant(functionIndexMeta != null, "Unknown Export");
  return {
    index: functionIndexMeta,
    kind: EXTERN_FUNCTION,
    field: node.value,
  };
}
