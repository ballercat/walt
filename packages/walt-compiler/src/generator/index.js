// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import walkNode from "../utils/walk-node";
import mapNode from "../utils/map-node";
import { stringEncoder } from "../utils/string";
import generateElement from "./element";
import generateExport from "./export";
import generateMemory from "./memory";
import generateTable from "./table";
import generateInitializer from "../generator/initializer";
import generateImport from "./import";
import generateType from "./type";
import { generateValueType } from "./utils";
import { generateImplicitFunctionType } from "./type";
import {
  GLOBAL_INDEX,
  FUNCTION_INDEX,
  FUNCTION_METADATA,
  TYPE_INDEX,
  AST_METADATA,
} from "../semantics/metadata";

import type { NodeType, ConfigType } from "../flow/types";
import type {
  ProgramType,
  IntermediateOpcodeType,
  IntermediateVariableType,
} from "./flow/types";

export const generateCode = (
  func: NodeType
): { code: IntermediateOpcodeType[], locals: IntermediateVariableType[] } => {
  // eslint-disable-next-line
  const [argsNode, resultNode, ...body] = func.params;

  const metadata = func.meta[FUNCTION_METADATA];
  invariant(body, "Cannot generate code for function without body");
  invariant(metadata, "Cannot generate code for function without metadata");

  const { locals, argumentsCount } = metadata;

  const block = {
    code: [],
    // On this Episode of ECMAScript Spec: Object own keys traversal!
    // Sometimes it pays to know the spec. Keys are traversed in the order
    // they are added to the object. This includes Object.keys. Because the AST is traversed
    // depth-first we can guarantee that arguments will also be added first
    // to the locals object. We can depend on the spec providing the keys,
    // such that we can slice away the number of arguments and get DECLARED locals _only_.
    locals: Object.keys(locals)
      .slice(argumentsCount)
      .map(key => generateValueType(locals[key])),
    debug: `Function ${func.value}`,
  };

  // NOTE: Declarations have a side-effect of changing the local count
  //       This is why mapSyntax takes a parent argument
  const mappedSyntax = body.map(mapSyntax(block));
  if (mappedSyntax) {
    block.code = mappedSyntax.reduce(mergeBlock, []);
  }

  return block;
};

export default function generator(
  ast: NodeType,
  config: ConfigType
): ProgramType {
  const program: ProgramType = {
    Version: config.version,
    Types: [],
    Code: [],
    Exports: [],
    Imports: [],
    Globals: [],
    Element: [],
    Functions: [],
    Memory: [],
    Table: [],
    Artifacts: [],
    Data: [],
    Name: {
      module: config.filename,
      functions: [],
      locals: [],
    },
  };

  // Encode the static memory values into Data section
  program.Data = Object.entries(ast.meta[AST_METADATA].statics).reduce(
    (acc, [key, val]: [string, any]) => {
      return [...acc, { offset: Number(val.value), data: stringEncoder(key) }];
    },
    []
  );

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
    [Syntax.Typedef]: (node, _ignore) => {
      let typeIndex = program.Types.findIndex(({ id }) => id === node.value);
      let typeNode = program.Types[typeIndex];

      if (typeNode == null) {
        typeIndex = program.Types.length;
        program.Types.push(generateType(node));
      }

      typeNode = {
        ...node,
        meta: { ...node.meta, [TYPE_INDEX]: typeIndex },
      };

      typeMap[node.value] = { typeIndex, typeNode };
      return typeNode;
    },
  })(ast);

  const nodeMap = {
    [Syntax.Typedef]: (_, __) => _,
    [Syntax.Export]: node => {
      const [nodeToExport] = node.params;
      program.Exports.push(generateExport(nodeToExport));
    },
    [Syntax.ImmutableDeclaration]: node => {
      const globalMeta = node.meta[GLOBAL_INDEX];
      if (globalMeta != null) {
        switch (node.type) {
          case "Memory":
            program.Memory.push(generateMemory(node));
            break;
          case "Table":
            program.Table.push(generateTable(node));
            break;
        }
      }
    },
    [Syntax.Declaration]: node => {
      const globalMeta = node.meta[GLOBAL_INDEX];
      if (globalMeta != null) {
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
        [Syntax.FunctionPointer]: pointer => {
          const metaFunctionIndex = pointer.meta[FUNCTION_INDEX];
          const functionIndex = metaFunctionIndex;
          let tableIndex = findTableIndex(functionIndex);
          if (tableIndex < 0) {
            tableIndex = program.Element.length;
            program.Element.push(generateElement(functionIndex));
          }
          return pointer;
        },
      })(node);

      // Quick fix for shifting around function indices. These don't necessarily
      // get written in the order they appear in the source code.
      const index = node.meta[FUNCTION_INDEX];
      invariant(index != null, "Function index must be set");

      program.Functions[index] = typeIndex;
      // We will need to filter out the empty slots later
      program.Code[index] = generateCode(patched);

      if (config.encodeNames) {
        program.Name.functions.push({
          index,
          name: node.value,
        });
        const functionMetadata = node.meta[FUNCTION_METADATA];
        if (
          functionMetadata != null &&
          Object.keys(functionMetadata.locals).length
        ) {
          program.Name.locals[index] = {
            index,
            locals: Object.entries(functionMetadata.locals).map(
              ([name, local]: [string, any]) => {
                return {
                  name,
                  index: Number(local.meta["local/index"]),
                };
              }
            ),
          };
        }
      }
    },
  };

  walkNode(nodeMap)(astWithTypes);

  // Unlike function indexes we need function bodies to be exact
  program.Code = program.Code.filter(Boolean);

  return program;
}
