//@flow
import generateFunctionCall from "./function-call";
import generateIndirectFunctionCall from "./indirect-function-call";
import generateBinaryExpression from "./binary-expression";
import generateTernary from "./ternary-expression";
import generateIf from "./if-then-else";
import generateFunctionPointer from "./function-pointer";
import generateReturn from "./return-statement";
import generateDeclaration from "./declaration";
import generateArraySubscript from "./array-subscript";
import generateAssignment from "./assignment";
import generateMemoryAssignment from "./memory-assignment";
import generateImport from "./import";
import generateLoop from "./loop";
import generateSequence from "./sequence";
import generateTypecast from "./typecast";
import generateBreak from "./break";
import generateNoop from "./noop";

import Syntax from "../Syntax";
import { getInScope, getConstOpcode } from "./utils";
import curry from "curry";
import invariant from "invariant";
import type { MapSyntaxType, GeneratorType } from "./flow/types";

import printNode from "../utils/print-node";

export const syntaxMap: { [string]: GeneratorType } = {
  [Syntax.FunctionCall]: generateFunctionCall,
  [Syntax.IndirectFunctionCall]: generateIndirectFunctionCall,
  // Unary
  [Syntax.Constant]: getConstOpcode,
  [Syntax.BinaryExpression]: generateBinaryExpression,
  [Syntax.TernaryExpression]: generateTernary,
  [Syntax.IfThenElse]: generateIf,
  [Syntax.Identifier]: getInScope,
  [Syntax.FunctionIdentifier]: getInScope,
  [Syntax.FunctionPointer]: generateFunctionPointer,
  [Syntax.ReturnStatement]: generateReturn,
  // Binary
  [Syntax.Declaration]: generateDeclaration,
  [Syntax.ArraySubscript]: generateArraySubscript,
  [Syntax.Assignment]: generateAssignment,
  // Memory
  [Syntax.MemoryAssignment]: generateMemoryAssignment,
  // Imports
  [Syntax.Import]: generateImport,
  // Loops
  [Syntax.Loop]: generateLoop,
  [Syntax.Break]: generateBreak,
  // Comma separated lists
  [Syntax.Sequence]: generateSequence,
  // Typecast
  [Syntax.TypeCast]: generateTypecast,
  [Syntax.Noop]: generateNoop
};

const mapSyntax: MapSyntaxType = curry((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  if (!mapping) {
    const value =
      operand.id ||
      operand.value ||
      (operand.operator && operand.operator.value);
    throw new Error(`Unexpected Syntax Token ${operand.Type} : ${value}`);
  }

  const validate = (block, i) =>
    invariant(
      block.kind,
      `Unknown opcode generated in block index %s %s. \nOperand: \n%s`,
      i,
      JSON.stringify(block),
      printNode(operand)
    );
  const blocks = mapping(operand, parent);
  if (Array.isArray(blocks)) {
    blocks.forEach(validate);
  }

  return blocks;
});

export default mapSyntax;
