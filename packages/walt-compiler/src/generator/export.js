// @flow
import { GLOBAL_INDEX, FUNCTION_INDEX } from '../semantics/metadata';
import {
  EXTERN_GLOBAL,
  EXTERN_MEMORY,
  EXTERN_TABLE,
  EXTERN_FUNCTION,
} from '../emitter/external_kind';
import type { NodeType, IntermediateExportType } from './flow/types';

const externaKindMap = {
  Memory: EXTERN_MEMORY,
  Table: EXTERN_TABLE,
};

export default function generateExport(node: NodeType): IntermediateExportType {
  const functionIndexMeta = node.meta[FUNCTION_INDEX];
  const globalIndexMeta = node.meta[GLOBAL_INDEX];

  if (globalIndexMeta != null) {
    const kind = externaKindMap[String(node.type)] || EXTERN_GLOBAL;
    const index = [EXTERN_MEMORY, EXTERN_TABLE].includes(kind)
      ? 0
      : globalIndexMeta;
    return {
      index,
      kind,
      field: node.value,
    };
  }

  return {
    index: functionIndexMeta,
    kind: EXTERN_FUNCTION,
    field: node.value,
  };
}
