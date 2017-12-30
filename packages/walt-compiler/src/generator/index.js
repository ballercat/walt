// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import walkNode from "../utils/walk-node";
import generateExport from "./export";
import generateMemory from "./memory";
import generateTable from "./table";
import generateInitializer from "../generator/initializer";
import generateImport from "./import";

import { get, GLOBAL_INDEX } from "../parser/metadata";

import type { NodeType, ProgramType } from "./flow/types";
import type {
  IntermediateOpcodeType,
  IntermediateVariableType,
} from "./flow/types";

export const generateCode = (
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

export default function generator(ast: NodeType): ProgramType {
  const program: ProgramType = {
    Types: [],
    Code: [],
    Exports: [],
    Imports: [],
    Globals: [],
    Element: [],
    Functions: [],
    Memory: [],
    Table: [],
  };

  walkNode({
    [Syntax.Export]: node => {
      const [nodeToExport] = node.params;
      program.Exports.push(generateExport(nodeToExport));
    },
    [Syntax.Declaration]: node => {
      const globalMeta = get(GLOBAL_INDEX, node);
      if (globalMeta !== null) {
        switch (node.type) {
          case "Memory":
            program.Memory.push(generateMemory(node));
            break;
          case "Table":
            program.Table.push(generateTable(node));
            break;
          default:
            program.Globals.push(generateInitializer(node));
        }
      }
    },
    [Syntax.Import]: node => {
      program.Imports.push(...generateImport(node));
    },
  })(ast);

  return program;
}
