// @flow
import type { NodeType } from "../../flow/types";
export type { NodeType } from "../../flow/types";
export type RawOpcodeType = {
  result: ?number,
  first: ?number,
  second: ?number,
  size: number,
  code: number,
  name: string,
  text: string,
};
export type IntermediateVariableTye = {
  mutable: 0 | 1,
  type: string,
};
export type IntermediateOpcodeType = {
  kind: RawOpcodeType,
  params: number[],
};
export type IntermediateFunctionType = {
  code: IntermediateOpcodeType[],
  locals: IntermediateVariableTye[],
};
export type MapSyntaxType = (
  ?IntermediateFunctionType,
) => NodeType => IntermediateOpcodeType[];

export type IntermediateTypeDefinitionType = {
  id: string,
  params: number[],
  result: ?number,
};

export type GeneratorType = (
  NodeType,
  IntermediateFunctionType,
) => IntermediateOpcodeType[];

export type IntermediateImportType = {
  module: string,
  field: string,
  global?: boolean,
  kind: number,
  typeIndex?: number,
};
