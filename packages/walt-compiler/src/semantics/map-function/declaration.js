// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import {
  get,
  CLOSURE_TYPE,
  array as setMetaArray,
  constant as setMetaConst,
  localIndex as setMetaLocalIndex,
  closureType as setClosure,
  typeIndex as setMetaTypeIndex,
  globalIndex as setMetaGlobalIndex,
} from "../metadata";

const getTypeSize = typeString => {
  switch (typeString) {
    case "i64":
    case "f64":
      return 8;
    case "i32":
    case "f32":
    default:
      return 4;
  }
};

const isClosureType = (types, type): boolean => {
  return types[type] != null && !!get(CLOSURE_TYPE, types[type]);
};

export const parseDeclaration = curry((isConst, options, declaration) => {
  const { types, locals, closures } = options;
  if (locals[declaration.value] == null) {
    const index = Object.keys(locals).length;
    const typeString = declaration.type;
    const modifier = declaration.type.slice(-2);
    const isArray = modifier === "[]";
    const isClosure = isClosureType(types, typeString);
    const type = (() => {
      if (isArray) {
        return "i32";
      } else if (isClosure) {
        return "i64";
      }
      return declaration.type;
    })();
    const metaArray = isArray ? setMetaArray(typeString.slice(0, -2)) : null;
    const metaClosure = isClosure ? setClosure(true) : null;
    const meta = [
      setMetaLocalIndex(index),
      metaArray,
      metaClosure,
      isConst ? setMetaConst() : null,
      isClosure
        ? setMetaTypeIndex(Object.keys(types).indexOf(typeString))
        : null,
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
      offsets[declaration.value] = closures.envSize;
      closures.envSize += getTypeSize(declaration.type);
    }
  }
});

export const parseGlobalDeclaration = curry((isConst, options, node) => {
  const { globals } = options;

  if (node.type !== "Table" && node.type !== "Memory") {
    const globalIndex = Object.keys(globals).length;
    const meta = [
      setMetaGlobalIndex(globalIndex),
      isConst ? setMetaConst() : null,
    ];
    globals[node.value] = { ...node, meta, Type: Syntax.Declaration };

    return globals[node.value];
  }
  return { ...node, meta: [setMetaGlobalIndex(-1)] };
});
