// @flow
import { get, GLOBAL_INDEX, FUNCTION_INDEX } from "../parser/metadata";
import { EXTERN_GLOBAL, EXTERN_FUNCTION } from "../emitter/external_kind";
import invariant from "invariant";
import type { NodeType, IntermediateExportType } from "./flow/types";

export default function generateExport(node: NodeType): IntermediateExportType {
  const functionIndexMeta = get(FUNCTION_INDEX, node);
  const globalIndexMeta = get(GLOBAL_INDEX, node);

  if (globalIndexMeta) {
    return {
      index: globalIndexMeta.payload,
      kind: EXTERN_GLOBAL,
      field: node.value,
    };
  }

  if (functionIndexMeta) {
    return {
      index: functionIndexMeta.payload,
      kind: EXTERN_FUNCTION,
      field: node.value,
    };
  }

  invariant(false, "Unknown Export");
}
