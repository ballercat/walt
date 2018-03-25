// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import type { NodeType } from "../../flow/types";
import { TYPE_OBJECT, OBJECT_KEY_TYPES, ALIAS } from "../metadata";

const patchStringSubscript = (
  byteOffsetsByKey: any,
  params: NodeType[]
): NodeType[] => {
  const field = params[1];
  const absoluteByteOffset = byteOffsetsByKey[field.value];
  return [
    params[0],
    {
      ...field,
      meta: { [ALIAS]: field.value },
      value: absoluteByteOffset,
      type: "i32",
      Type: Syntax.Constant,
    },
  ];
};

const mapArraySubscript = curry(({ userTypes }, node, mapChildren) => {
  const params = node.params.map(mapChildren);
  const [identifier, field] = params;
  const userType = userTypes[identifier.type];
  if (userType != null) {
    const metaObject = userType.meta[TYPE_OBJECT];
    const objectKeyTypeMap = userType.meta[OBJECT_KEY_TYPES];
    return {
      ...node,
      type: objectKeyTypeMap ? objectKeyTypeMap[field.value] : "i32",
      params: patchStringSubscript(metaObject, params),
    };
  }

  if (identifier.type === "Memory") {
    return {
      ...node,
      type: "i32",
      params: [
        { ...node, type: "i32", Type: Syntax.Constant, value: "0", params: [] },
        { ...node, type: "i32", Type: Syntax.Constant, value: "0", params: [] },
      ],
    };
  }

  const type = identifier.type;

  return {
    ...node,
    type,
    params,
  };
});

export default mapArraySubscript;
