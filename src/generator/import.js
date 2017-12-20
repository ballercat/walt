import { EXTERN_GLOBAL, EXTERN_FUNCTION } from "../emitter/external_kind";

const generateImport = node => {
  const module = node.module;
  return node.fields.map(
    ({ id, nativeType, typeIndex, global, kind: importType }) => {
      const kind = (() => {
        if (importType) {
          return importType;
        }

        if (nativeType) {
          return EXTERN_GLOBAL;
        }

        return EXTERN_FUNCTION;
      })();
      return {
        module,
        field: id,
        global,
        kind,
        typeIndex
      };
    }
  );
};

export default generateImport;
