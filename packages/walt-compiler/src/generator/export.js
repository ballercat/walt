// @flow
import { GLOBAL_INDEX, FUNCTION_INDEX } from "../semantics/metadata";
import { EXTERN_GLOBAL, EXTERN_FUNCTION } from "../emitter/external_kind";
import type { NodeType, IntermediateExportType } from "./flow/types";

export default function generateExport(node: NodeType): IntermediateExportType {
  const functionIndexMeta = node.meta[FUNCTION_INDEX];
  const globalIndexMeta = node.meta[GLOBAL_INDEX];

  if (globalIndexMeta != null) {
    return {
      index: globalIndexMeta,
      kind: EXTERN_GLOBAL,
      field: node.value,
    };
  }

  return {
    index: functionIndexMeta,
    kind: EXTERN_FUNCTION,
    field: node.value,
  };
}
