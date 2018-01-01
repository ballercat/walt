// @flow
import invariant from "invariant";
import generateExpression from "./expression";
import { generateValueType } from "./utils";
import opcode from "../emitter/opcode";
import { get, LOCAL_INDEX } from "../metadata/metadata";
import type { GeneratorType } from "./flow/types";

const generateDeclaration: GeneratorType = (
  node,
  parent = { code: [], locals: [] }
) => {
  const initNode = node.params[0];

  if (parent && Array.isArray(parent.locals)) {
    parent.locals.push(generateValueType(node));
  }

  if (initNode) {
    const metaIndex = get(LOCAL_INDEX, node);
    invariant(
      metaIndex,
      "Local Index is undefined. Cannot generate declaration"
    );
    return [
      ...generateExpression({ ...initNode, type: node.type }, parent),
      { kind: opcode.SetLocal, params: [metaIndex.payload] },
    ];
  }

  return [];
};

export default generateDeclaration;
