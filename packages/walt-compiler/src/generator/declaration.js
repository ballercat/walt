// @flow
import invariant from "invariant";
import generateExpression from "./expression";
import { generateValueType, isBuiltinType } from "./utils";
import opcode from "../emitter/opcode";
import { get, LOCAL_INDEX } from "../semantics/metadata";
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
    invariant(metaIndex, `Local Index is undefined. Node: ${node.value}`);

    const type = isBuiltinType(node.type) ? node.type : "i32";

    return [
      ...generateExpression({ ...initNode, type }, parent),
      {
        kind: opcode.SetLocal,
        params: [metaIndex.payload],
        debug: `${node.value}<${node.type ? node.type : "?"}>`,
      },
    ];
  }

  return [];
};

export default generateDeclaration;
