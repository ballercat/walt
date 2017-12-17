// @flow
import { EXTERN_FUNCTION, EXTERN_GLOBAL } from "../emitter/external_kind";
import type { GeneratorType } from "./flow/types";

const generateImport: GeneratorType = node => {
  const module = node.module;
  return node.fields.map(({ id, nativeType, typeIndex, global, kind }) => {
    kind = kind || (nativeType && EXTERN_GLOBAL || EXTERN_FUNCTION);
    return {
      module,
      field: id,
      global,
      kind,
      typeIndex,
    };
  });
};

export default generateImport;
