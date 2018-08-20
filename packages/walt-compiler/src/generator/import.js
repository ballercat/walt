// @flow
import Syntax from 'walt-syntax';
import walkNode from 'walt-parser-tools/walk-node';
import { stringToType } from '../emitter/value_type';
import { parseBounds } from '../utils/resizable-limits';
import {
  EXTERN_FUNCTION,
  EXTERN_MEMORY,
  EXTERN_GLOBAL,
  EXTERN_TABLE,
} from '../emitter/external_kind';
import { TYPE_INDEX } from '../semantics/metadata';
import type { IntermediateImportType, NodeType } from './flow/types';

export const getKindConstant = (value: string) => {
  switch (value) {
    case 'Memory':
      return EXTERN_MEMORY;
    case 'Table':
      return EXTERN_TABLE;
    case 'i32':
    case 'f32':
    case 'i64':
    case 'f64':
      return EXTERN_GLOBAL;
    default:
      return EXTERN_FUNCTION;
  }
};

const getFieldName = node => {
  let name = node.value;
  if (node.meta.AS != null) {
    return node.meta.AS;
  }

  return name;
};

export default function generateImportFromNode(
  node: NodeType
): IntermediateImportType[] {
  const [importsNode, moduleStringLiteralNode] = node.params;
  const { value: module } = moduleStringLiteralNode;
  const imports: IntermediateImportType[] = [];

  // Look for Pair Types, encode them into imports array
  walkNode({
    [Syntax.Pair]: (pairNode, _) => {
      const [fieldIdentifierNode, typeOrIdentifierNode] = pairNode.params;

      const field = getFieldName(fieldIdentifierNode);
      const { value: importTypeValue } = typeOrIdentifierNode;

      const kind = getKindConstant(importTypeValue);

      const typeIndex = (() => {
        const typeIndexMeta = typeOrIdentifierNode.meta[TYPE_INDEX];
        if (typeIndexMeta) {
          return typeIndexMeta;
        }
        return null;
      })();
      const bounds =
        importTypeValue === 'Memory' ? parseBounds(typeOrIdentifierNode) : {};

      imports.push({
        module,
        field,
        global: kind === EXTERN_GLOBAL,
        kind,
        type: stringToType[importTypeValue],
        typeIndex,
        ...bounds,
      });
    },
  })(importsNode);

  return imports;
}
