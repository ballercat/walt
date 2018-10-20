// @flow
import generateFunctionCall from './function-call';
import generateIndirectFunctionCall from './indirect-function-call';
import generateBinaryExpression from './binary-expression';
import generateTernary from './ternary-expression';
import generateIf from './if-then-else';
import generateFunctionPointer from './function-pointer';
import generateReturn from './return-statement';
import generateDeclaration from './declaration';
import generateArraySubscript from './array-subscript';
import generateAssignment from './assignment';
import generateMemoryAssignment from './memory-assignment';
import generateLoop from './loop';
import generateTypecast from './typecast';
import generateBreak from './break';
import generateNoop from './noop';
import generateBlock from './block';
import generateElse from './else';
import generateSelect from './select';
import generateNative from './native';
import generateAccess from './access';

import Syntax from 'walt-syntax';
import { getInScope, getConstOpcode } from './utils';
import curry from 'curry';
import invariant from 'invariant';
import type { MapSyntaxType, GeneratorType } from './flow/types';

export const syntaxMap: { [string]: GeneratorType } = {
  [Syntax.Access]: generateAccess,
  [Syntax.FunctionCall]: generateFunctionCall,
  [Syntax.IndirectFunctionCall]: generateIndirectFunctionCall,
  // Unary
  [Syntax.Constant]: getConstOpcode,
  [Syntax.BinaryExpression]: generateBinaryExpression,
  [Syntax.TernaryExpression]: generateTernary,
  [Syntax.IfThenElse]: generateIf,
  [Syntax.Else]: generateElse,
  [Syntax.Select]: generateSelect,
  [Syntax.Block]: generateBlock,
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
  // Loops
  [Syntax.Loop]: generateLoop,
  [Syntax.Break]: generateBreak,
  // Typecast
  [Syntax.TypeCast]: generateTypecast,
  [Syntax.Noop]: generateNoop,
  [Syntax.NativeMethod]: generateNative,
};

const mapSyntax: MapSyntaxType = curry((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  invariant(
    mapping,
    `Unexpected Syntax Token. ${operand.Type} "${operand.value}"`
  );

  return mapping(operand, parent);
});

export default mapSyntax;
