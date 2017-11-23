import type { NodeType } from "../../flow/types";

export type RawOpcodeType = {
  result: ?number,
  first: ?number,
  second: ?number,
  size: number,
  code: number,
  name: string,
  text: string
};
export type IntermediateOpcodeType = {
  kind: RawOpcodeType,
  params: number[]
};
export type IntermediateFunctionType = {
  code: IntermediateOpcodeType[],
  locals: IntermediateOpcodeType[]
};
export type MapSyntaxType = IntermediateFunctionType => NodeType => IntermediateOpcodeType[];

export type IntermediateTypeDefinitionType = {
  id: number,
  params: number[],
  result: number
};

export type GeneratorType = (
  NodeType,
  IntermediateOpcodeType
) => IntermediateOpcodeType[];
