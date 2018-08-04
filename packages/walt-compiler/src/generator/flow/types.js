// @flow
import type OutputStream from '../../utils/output-stream';
import type { NodeType } from '../../flow/types';
export type { NodeType };
export type RawOpcodeType = {
  result: ?number,
  first: ?number,
  second: ?number,
  size: number,
  code: number,
  name: string,
  text: string,
};
export type IntermediateVariableType = {
  mutable: 0 | 1,
  type: number,
  init?: number,
};
export type IntermediateOpcodeType = {
  kind: RawOpcodeType,
  params: number[],
  valueType?: IntermediateVariableType,
};
export type IntermediateFunctionType = {
  code: IntermediateOpcodeType[],
  locals: IntermediateVariableType[],
};
export type MapSyntaxType = (
  ?IntermediateFunctionType
) => NodeType => IntermediateOpcodeType[];

export type IntermediateTypeDefinitionType = {
  id: string,
  params: number[],
  result: number | null,
};

export type GeneratorType = (
  NodeType,
  IntermediateFunctionType
) => IntermediateOpcodeType[];

export type IntermediateImportType = {
  module: string,
  field: string,
  global: boolean,
  kind: number,
  typeIndex: number | null,
};

export type IntermediateExportType = {
  index: number,
  kind: number,
  field: string,
};

export type IntermediateTableType = {
  max: number,
  initial: number,
  type: string,
};
export type IntermediateMemoryType = { max: number, initial: number };

export type FunctionNameType = { index: number, name: string };
export type NameSectionType = {
  module: string,
  functions: FunctionNameType[],
  locals: Array<{
    index: number,
    locals: Array<{ index: number, name: string }>,
  }>,
};
export type DataSectionType = Array<{
  offset: number,
  data: OutputStream,
}>;

export type ProgramType = {
  // Setup keys needed for the emitter
  Version: number,
  Types: IntermediateTypeDefinitionType[],
  Code: IntermediateFunctionType[],
  Exports: IntermediateExportType[],
  Imports: IntermediateImportType[],
  Globals: IntermediateVariableType[],
  Element: Array<{ functionIndex: number }>,
  Functions: number[],
  Memory: IntermediateMemoryType[],
  Table: IntermediateTableType[],
  Artifacts: NodeType[],
  Name: NameSectionType,
  Data: DataSectionType,
  Start: number[],
};
