// @flow
import curry from "curry";
import invariant from "invariant";
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import type { NodeType } from "../flow/types";
import { objectSize, objectType, objectKeyTypes } from "./metadata";

export const getByteOffsetsAndSize = (
  objectLiteralNode: NodeType
): [{ [string]: number }, number, { [string]: string }] => {
  const offsetsByKey = {};
  const keyTypeMap = {};
  let size = 0;
  walkNode({
    [Syntax.Pair]: keyTypePair => {
      const { value: key } = keyTypePair.params[0];
      const { value: typeString } = keyTypePair.params[1];
      invariant(
        offsetsByKey[key] == null,
        `Duplicate key ${key} not allowed in object type`
      );

      keyTypeMap[key] = typeString;
      offsetsByKey[key] = size;
      switch (typeString) {
        case "i32":
        case "f32":
          size += 4;
          break;
        case "i64":
        case "f64":
          size += 8;
          break;
        default:
          size += 4;
      }
    },
  })(objectLiteralNode);

  return [offsetsByKey, size, keyTypeMap];
};

const mapStruct = curry(({ userTypes }, node, _ignore) => {
  const [offsetsByKey, totalSize, keyTypeMap] = getByteOffsetsAndSize(
    node.params[0]
  );

  const struct = {
    ...node,
    meta: [
      objectType(offsetsByKey),
      objectSize(totalSize),
      objectKeyTypes(keyTypeMap),
    ],
  };

  userTypes[struct.value] = struct;
  return struct;
});

export default mapStruct;
