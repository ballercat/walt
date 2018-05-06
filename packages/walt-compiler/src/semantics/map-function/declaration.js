// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import {
  CLOSURE_TYPE,
  TYPE_ARRAY,
  TYPE_CONST,
  TYPE_INDEX,
  LOCAL_INDEX,
  GLOBAL_INDEX,
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
  return types[type] != null && !!types[type].meta[CLOSURE_TYPE];
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
  const meta = {
    [TYPE_ARRAY]: isArray ? typeString.slice(0, -2) : null,
    [CLOSURE_TYPE]: isClosure || null,
    [TYPE_CONST]: isConst || null,
    [TYPE_INDEX]: isClosure ? Object.keys(types).indexOf(typeString) : null,
  };

  return [type, meta, index];
};

export const parseDeclaration = curry((isConst, options, declaration) => {
  const { locals: scope, closures } = options;
  const [type, meta, index] = parse(
    isConst,
    { ...options, scope },
    declaration
  );

  const params = declaration.params.map(node => ({
    ...node,
    type: declaration.type,
  }));

  scope[declaration.value] = {
    ...declaration,
    params,
    type,
    meta: { ...meta, [LOCAL_INDEX]: index },
    Type: Syntax.Declaration,
  };

  const { variables } = closures;
  if (variables[declaration.value] != null && declaration.params[0]) {
    const { offsets } = closures;
    offsets[declaration.value] = closures.envSize;
    closures.envSize += getTypeSize(declaration.type);
  }
});

export const parseGlobalDeclaration = curry((isConst, options, node) => {
  const { globals: scope } = options;
  if (node.type !== "Table" && node.type !== "Memory") {
    const [type, meta, index] = parse(isConst, { ...options, scope }, node);
    scope[node.value] = {
      ...node,
      meta: { ...meta, [GLOBAL_INDEX]: index },
      type,
      Type: Syntax.Declaration,
    };

    return scope[node.value];
  }
  return { ...node, meta: { [GLOBAL_INDEX]: -1 } };
});
