// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import walkNode from "../utils/walk-node";
import mapNode from "../utils/map-node";
import generateElement from "./element";
import generateExport from "./export";
import generateMemory from "./memory";
import generateTable from "./table";
import generateInitializer from "../generator/initializer";
import generateImport from "./import";
import generateType from "./type";
import { generateImplicitFunctionType } from "./type";

import {
  get,
  GLOBAL_INDEX,
  FUNCTION_INDEX,
  TYPE_OBJECT,
  typeIndex as setMetaTypeIndex,
} from "../semantics/metadata";

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

  const findTypeIndex = (functionNode: NodeType): number => {
    const search = generateImplicitFunctionType(functionNode);

    return program.Types.findIndex(t => {
      const paramsMatch =
        t.params.length === search.params.length &&
        t.params.reduce((a, v, i) => a && v === search.params[i], true);

      const resultMatch = t.result === search.result;

      return paramsMatch && resultMatch;
    });
  };

  const findTableIndex = functionIndex =>
    program.Element.findIndex(n => n.functionIndex === functionIndex);

  const typeMap = {};
  const astWithTypes = mapNode({
    [Syntax.Typedef]: node => {
      let typeIndex = program.Types.findIndex(({ id }) => id === node.value);
      let typeNode = program.Types[typeIndex];

      if (typeNode == null) {
        typeIndex = program.Types.length;
        program.Types.push(generateType(node));
      }

      typeNode = {
        ...node,
        meta: [...node.meta, setMetaTypeIndex(typeIndex)],
      };

      typeMap[node.value] = { typeIndex, typeNode };
      return typeNode;
    },
  })(ast);

  const nodeMap = {
    [Syntax.Export]: node => {
      const [nodeToExport] = node.params;
      program.Exports.push(generateExport(nodeToExport));
    },
    [Syntax.ImmutableDeclaration]: node => {
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
    [Syntax.Declaration]: node => {
      const globalMeta = get(GLOBAL_INDEX, node);
      if (globalMeta !== null) {
        program.Globals.push(generateInitializer(node));
      }
    },
    [Syntax.Import]: node => {
      program.Imports.push(...generateImport(node));
    },
    [Syntax.FunctionDeclaration]: node => {
      const typeIndex = (() => {
        const index = findTypeIndex(node);
        if (index === -1) {
          // attach to a type index
          program.Types.push(generateImplicitFunctionType(node));
          return program.Types.length - 1;
        }

        return index;
      })();

      const patched = mapNode({
        [Syntax.Type]: typeNode => {
          const userDefinedType = typeMap[typeNode.value];
          if (userDefinedType != null) {
            return {
              ...typeNode,
              meta: [...typeNode.meta, setMetaTypeIndex(userDefinedType.index)],
            };
          }

          return typeNode;
        },
        [Syntax.FunctionPointer]: pointer => {
          const metaFunctionIndex = get(FUNCTION_INDEX, pointer);
          if (metaFunctionIndex) {
            const functionIndex = metaFunctionIndex.payload;
            let tableIndex = findTableIndex(functionIndex);
            if (tableIndex < 0) {
              tableIndex = program.Element.length;
              program.Element.push(generateElement(functionIndex));
            }
          }
          return pointer;
        },
      })(node);

      program.Functions.push(typeIndex);
      program.Code.push(generateCode(patched));
    },
  };

  walkNode(nodeMap)(astWithTypes);

  return program;
}
