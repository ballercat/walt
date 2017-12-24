// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import type Context from "./context";
import expression from "./expression";
import walkNode from "../utils/walk-node";
import generateType from "../generator/type";
import type { NodeType } from "../flow/types";
import {
  get,
  objectSize,
  objectType,
  objectKeyTypes,
  typeIndex as setMetaTypeIndex,
  TYPE_OBJECT,
} from "./metadata";

// A scenario where the type declared needs to be hoisted exists during imports.
// We may want to import a function with a specific type, but we cannot declare
// the type inline(at least not currently). Once we do find the appropriate type
// here we _hoist_ it in the binary output by placing it literally before the
// binary imports inside our Program.
export const hoistTypeMaybe = (ctx: Context, node: NodeType) => {
  // At this point we may have found a type which needs to hoist
  const needsHoisting = ctx.Program.Types.find(
    ({ id, hoist }) => id === node.value && hoist
  );

  if (needsHoisting) {
    needsHoisting.hoist(node);
  }

  if (get(TYPE_OBJECT, node) == null) {
    ctx.Program.Types.push(generateType(node));
    node.meta.push(setMetaTypeIndex(ctx.Program.Types.length - 1));
    ctx.functionTypes[node.value] = node;
  }
};

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

export default function typeParser(ctx: Context): NodeType {
  const node: NodeType = ctx.startNode();
  ctx.eat(["type"]);

  node.value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect(["="]);

  // Quick way to figure out if we are looking at an object to follow or a function definition.
  const isObjectType = ctx.token.value === "{";

  // All typedefs should be valid expressions
  node.params = [expression(ctx)];

  if (isObjectType) {
    const [offsetsByKey, totalSize, keyTypeMap] = getByteOffsetsAndSize(
      node.params[0]
    );
    node.meta.push(objectType(offsetsByKey));
    node.meta.push(objectSize(totalSize));
    node.meta.push(objectKeyTypes(keyTypeMap));
    node.type = "i32";
    ctx.userTypes[node.value] = node;
  } else {
    const resultNode = node.params[0].params[1] || node.params[0].params[0];
    node.type = resultNode.type;
  }

  hoistTypeMaybe(ctx, node);

  return ctx.endNode(node, Syntax.Typedef);
}
