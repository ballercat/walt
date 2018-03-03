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
const parse = (isConst, { types, scope }, declaration) => {
  const index = Object.keys(scope).length;
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
    metaArray,
    metaClosure,
    isConst ? setMetaConst() : null,
    isClosure ? setMetaTypeIndex(Object.keys(types).indexOf(typeString)) : null,
  ];

  return [type, meta, index];
};

export const parseDeclaration = curry((isConst, options, declaration) => {
  const { locals: scope, closures } = options;
  if (scope[declaration.value] == null) {
    const [type, meta, index] = parse(
      isConst,
      { ...options, scope },
      declaration
    );
    scope[declaration.value] = {
      ...declaration,
      type,
      meta: [...meta, setMetaLocalIndex(index)],
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
  const { globals: scope } = options;
  if (node.type !== "Table" && node.type !== "Memory") {
    const [type, meta, index] = parse(isConst, { ...options, scope }, node);
    scope[node.value] = {
      ...node,
      meta: [...meta, setMetaGlobalIndex(index)],
      type,
      Type: Syntax.Declaration,
    };

    return scope[node.value];
  }
  return { ...node, meta: [setMetaGlobalIndex(-1)] };
});
