/**
 * This module contains all the general purpose mappings of Node Type to
 * generator functions.
 *
 * @flow
 */
import generateFunctionCall from './function-call';
import generateIndirectFunctionCall from './indirect-function-call';
import generateBinaryExpression from './binary-expression';
import generateTernary from './ternary-expression';
import generateIf from './if-then-else';
import generateFunctionPointer from './function-pointer';
import generateReturn from './return-statement';
import generateDeclaration from './declaration';
import generateAssignment from './assignment';
import generateAssignmentExpression from './assignment-expression';
import generateLoop from './loop';
import generateTypecast from './typecast';
import generateBreak from './break';
import generateNoop from './noop';
import generateBlock from './block';
import generateElse from './else';
import generateSelect from './select';
import generateNative from './native';
import generateAccess from './access';
import generateConstant from './constant';

import Syntax from 'walt-syntax';
import { getInScope } from './utils';
import curry from 'curry';
import invariant from 'invariant';
import type { MapSyntaxType, GeneratorType } from './flow/types';

export const syntaxMap: { [string]: GeneratorType } = {
  [Syntax.Access]: generateAccess,
  [Syntax.FunctionCall]: generateFunctionCall,
  [Syntax.IndirectFunctionCall]: generateIndirectFunctionCall,
  // Unary
  [Syntax.Constant]: generateConstant,
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
  [Syntax.Assignment]: generateAssignment,
  [Syntax.AssignmentExpression]: generateAssignmentExpression,
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
    `Unsupported Syntax Token. ${operand.Type} "${operand.value}"`
  );

  return mapping(operand, parent);
});

export default mapSyntax;
