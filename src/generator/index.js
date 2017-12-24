// @flow
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import type { NodeType } from "../flow/types";
import type {
  IntermediateOpcodeType,
  IntermediateVariableType,
} from "./flow/types";
import invariant from "invariant";

const generateCode = (
  func: NodeType
): { code: IntermediateOpcodeType[], locals: IntermediateVariableType[] } => {
  // eslint-disable-next-line
  const [argsNode, resultNode, ...body] = func.params;

  invariant(body, "Cannot generate code for function without body");

  const block = {
    code: [],
    locals: [],
  };

  // NOTE: Declarations have a side-effect of changing the local count
  //       This is why mapSyntax takes a parent argument
  const mappedSyntax = body.map(mapSyntax(block));
  if (mappedSyntax) {
    block.code = mappedSyntax.reduce(mergeBlock, []);
  }

  return block;
};

export default generateCode;
