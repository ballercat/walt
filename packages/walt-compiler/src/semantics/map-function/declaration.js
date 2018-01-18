// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import {
  array as setMetaArray,
  constant as setMetaConst,
  localIndex as setMetaLocalIndex,
  closureType as setClosure,
  typeIndex as setMetaTypeIndex,
} from "../metadata";

export const parseDeclaration = curry((isConst, options, declaration) => {
  const { types, locals, closures } = options;
  if (locals[declaration.value] == null) {
    const index = Object.keys(locals).length;
    const base = declaration.type.slice(0, -2);
    const modifier = declaration.type.slice(-2);
    const isArray = modifier === "[]";
    const isClosure = modifier === "<>";
    const type = (() => {
      if (isArray) {
        return "i32";
      } else if (isClosure) {
        return "i64";
      }
      return declaration.type;
    })();
    const metaArray = isArray ? setMetaArray(base) : null;
    const metaClosure = isClosure ? setClosure(true) : null;
    const meta = [
      setMetaLocalIndex(index),
      metaArray,
      metaClosure,
      isConst ? setMetaConst() : null,
      isClosure ? setMetaTypeIndex(Object.keys(types).indexOf(base)) : null,
    ];
    locals[declaration.value] = {
      ...declaration,
      type,
      meta,
      Type: Syntax.Declaration,
    };

    const { variables } = closures;
    if (variables[declaration.value] != null && declaration.params[0]) {
      const { offsets } = closures;
      const offset: number = Object.values(offsets).pop() || -4;
      offsets[declaration.value] = offset + 4;
    }
  }
});
