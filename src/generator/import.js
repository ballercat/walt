// @flow
import { EXTERN_FUNCTION, EXTERN_GLOBAL } from "../emitter/external_kind";
import type { IntermediateImportType } from "./flow/types";

// this is messy
export default function generateImport(importsNode: {
  module: string,
  fields: [
    {
      id: string,
      nativeType?: boolean,
      typeIndex?: number,
      global?: boolean,
      kind: number,
    },
  ],
}): IntermediateImportType[] {
  const module = importsNode.module;
  return importsNode.fields.map(
    ({ id, nativeType, typeIndex, global, kind }) => {
      kind = kind || ((nativeType && EXTERN_GLOBAL) || EXTERN_FUNCTION);
      return {
        module,
        field: id,
        global,
        kind,
        typeIndex,
      };
    },
  );
}
