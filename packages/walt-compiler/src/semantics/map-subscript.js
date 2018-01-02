// @flow
import Syntax from "../Syntax";
import curry from "curry";
import type { NodeType } from "../flow/types";
import { get, TYPE_OBJECT, OBJECT_KEY_TYPES } from "./metadata";

const patchStringSubscript = (
  metaObject: any,
  params: NodeType[]
): NodeType[] => {
  const field = params[1];
  const { payload: byteOffsetsByKey } = metaObject;
  const absoluteByteOffset = byteOffsetsByKey[field.value];
  return [
    params[0],
    { ...field, value: absoluteByteOffset, type: "i32", Type: Syntax.Constant },
  ];
};

const mapArraySubscript = curry(({ userTypes }, node, mapChildren) => {
  const params = node.params.map(mapChildren);
  const [identifier, field] = params;
  const userType = userTypes[identifier.type];
  if (userType != null) {
    const metaObject = get(TYPE_OBJECT, userType);
    const objectKeyTypeMap = get(OBJECT_KEY_TYPES, userType);
    return {
      ...node,
      type: objectKeyTypeMap ? objectKeyTypeMap.payload[field.value] : "i32",
      params: patchStringSubscript(metaObject, params),
    };
  }

  return {
    ...node,
    type: identifier.type,
    params,
  };
});

export default mapArraySubscript;
