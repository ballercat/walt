// @flow
// AST Validator
import Syntax, { statements as ALL_POSSIBLE_STATEMENTS } from '../Syntax';
import walkNode from '../utils/walk-node';
import error from '../utils/generate-error';
import { isBuiltinType } from '../generator/utils';
import {
  GLOBAL_INDEX,
  TYPE_CONST,
  ALIAS,
  AST_METADATA,
} from '../semantics/metadata';
import { typeWeight } from '../types';
import type { NodeType } from '../flow/types';

const GLOBAL_LABEL = 'global';

// We walk the the entire tree and perform syntax validation before we continue
// onto the generator. This may throw sometimes
export default function validate(
  ast: NodeType,
  {
    filename,
  }: {
    filename: string,
  }
) {
  const metadata = ast.meta[AST_METADATA];
  if (metadata == null) {
    throw new Error('Missing AST metadata!');
  }
  const { types, functions, userTypes } = metadata;
  const problems = [];

  walkNode({
    [Syntax.Export]: _export => {
      const target = _export.params[0];
      const [start, end] = target.range;
      const globalIndex = target.meta[GLOBAL_INDEX];
      if (globalIndex != null && !target.params.length) {
        problems.push(
          error(
            'Global exports must have a value',
            '',
            { start, end },
            filename,
            GLOBAL_LABEL
          )
        );
      }
    },
    [Syntax.Import]: (importNode, _) => {
      walkNode({
        [Syntax.BinaryExpression]: (binary, __) => {
          const [start, end] = binary.range;
          problems.push(
            error(
              "Using an 'as' import without a type.",
              'A type for original import ' +
                binary.params[0].value +
                ' is not defined nor could it be inferred.',
              { start, end },
              filename,
              GLOBAL_LABEL
            )
          );
        },
        [Syntax.Identifier]: (identifier, __) => {
          const [start, end] = identifier.range;
          problems.push(
            error(
              'Infered type not supplied.',
              "Looks like you'd like to infer a type, but it was never provided by a linker. Non-concrete types cannot be compiled.",
              { start, end },
              filename,
              GLOBAL_LABEL
            )
          );
        },
        [Syntax.Pair]: (pair, __) => {
          const type = pair.params[1];
          if (!isBuiltinType(type.value) && types[type.value] == null) {
            const [start, end] = type.range;
            problems.push(
              error(
                `Undefined Type ${type.value}`,
                `Invalid Import. ${type.value} type does not exist`,
                { start, end },
                filename,
                GLOBAL_LABEL
              )
            );
          }
        },
      })(importNode);
    },
    // All of the validators below need to be implemented
    [Syntax.Struct]: (_, __) => {},
    [Syntax.ImmutableDeclaration]: (_, __) => {},
    [Syntax.Declaration]: (decl, _validator) => {
      const [start, end] = decl.range;
      const [initializer] = decl.params;

      if (decl.meta[TYPE_CONST]) {
        const validTypes = [Syntax.Constant, Syntax.StringLiteral];
        if (initializer != null && !validTypes.includes(initializer.Type)) {
          problems.push(
            error(
              'Global Constants must be initialized with a Number literal.',
              'WebAssembly does not allow for non number literal constant initializers.',
              { start, end },
              filename,
              GLOBAL_LABEL
            )
          );
        }

        if (initializer == null) {
          problems.push(
            error(
              'Constant declaration without an initializer.',
              'Global constants must be initialized with a Number literal.',
              { start, end },
              filename,
              GLOBAL_LABEL
            )
          );
        }
      }
      if (
        !isBuiltinType(decl.type) &&
        !types[decl.type] &&
        !userTypes[decl.type]
      ) {
        problems.push(
          error(
            'Unknown type used in a declaration, ' + `"${String(decl.type)}"`,
            'Variables must be assigned with a known type.',
            { start, end },
            filename,
            GLOBAL_LABEL
          )
        );
      }
    },
    [Syntax.FunctionDeclaration]: (func, __) => {
      const functionName = `${func.value}()`;
      walkNode({
        [Syntax.Declaration]: (node, _validator) => {
          const [start, end] = node.range;
          const [initializer] = node.params;
          if (
            initializer != null &&
            ALL_POSSIBLE_STATEMENTS[initializer.Type] != null
          ) {
            problems.push(
              error(
                `Unexpected statement ${initializer.Type}`,
                'Attempting to assign a statement to a variable. Did you miss a semicolon(;)?',
                { start, end },
                filename,
                functionName
              )
            );
          }
          if (node.meta[TYPE_CONST]) {
            if (initializer == null) {
              problems.push(
                error(
                  'Constant declaration without an initializer.',
                  'Local Constants must be initialized with an expression.',
                  { start, end },
                  filename,
                  functionName
                )
              );
            }
          }

          if (
            !isBuiltinType(node.type) &&
            !types[node.type] &&
            !userTypes[node.type]
          ) {
            problems.push(
              error(
                'Unknown type used in a declartion, ' +
                  `"${String(node.type)}"`,
                'Variables must be assigned with a known type.',
                { start, end },
                filename,
                functionName
              )
            );
          }
        },
        [Syntax.Assignment]: node => {
          const [identifier] = node.params;
          const [start, end] = node.range;
          const statement = node.params.find(
            param => ALL_POSSIBLE_STATEMENTS[param.Type] != null
          );
          if (statement != null) {
            problems.push(
              error(
                'Unexpected statement in assignment',
                'Statments cannot be used in assignment expressions. Did you miss a semicolon?',
                { start: statement.range[0], end: statement.range[1] },
                filename,
                functionName
              )
            );
          }

          const isConst = identifier.meta[TYPE_CONST];
          if (isConst) {
            problems.push(
              error(
                `Cannot reassign a const variable ${identifier.value}`,
                'const variables cannot be reassigned, use let instead.',
                { start, end },
                filename,
                functionName
              )
            );
          }
        },
        [Syntax.ArraySubscript]: (node, _validator) => {
          const [identifier, offset] = node.params;
          const [start, end] = node.range;
          if (offset.value == null) {
            const alias = offset.meta[ALIAS];
            problems.push(
              error(
                'Cannot generate memory offset',
                `Undefined key ${
                  alias != null ? alias : offset.value
                } for type ${String(identifier.meta.ALIAS)}`,
                { start, end },
                filename,
                functionName
              )
            );
          }
        },
        [Syntax.ReturnStatement]: (node, validator) => {
          node.params.map(validator);
          if (func.type == null) {
            return;
          }
          const [expression] = node.params;

          const [start] = node.range;
          const end = expression != null ? expression.range[1] : node.range[1];
          const type = node.type;

          if (typeWeight(type) !== typeWeight(func.type)) {
            problems.push(
              error(
                'Missing return value',
                'Inconsistent return value. Expected ' +
                  func.type +
                  ' received ' +
                  String(type),
                { start, end },
                filename,
                functionName
              )
            );
          }
        },
        [Syntax.FunctionCall]: (node, _validator) => {
          if (functions[node.value] == null) {
            const [start, end] = node.range;

            problems.push(
              error(
                'Undefined function reference',
                `${node.value} is not defined.`,
                { start, end },
                filename,
                functionName
              )
            );
          }
        },
        [Syntax.IndirectFunctionCall]: (node, _validator) => {
          const identifier = node.params[node.params.length - 1];
          const type = types[identifier.type];

          if (!isBuiltinType(identifier.type) && type == null) {
            const [start, end] = node.range;
            problems.push(
              error(
                'Cannot make an indirect call without a valid function type',
                `${identifier.value} has type ${String(
                  identifier.type
                )} which is not defined. Indirect calls must have pre-defined types.`,
                { start, end },
                filename,
                functionName
              )
            );
          }
        },
      })(func);
    },
  })(ast);

  const problemCount = problems.length;
  if (problemCount > 0) {
    const errorString = problems.reduce((acc, value) => {
      return acc + '\n' + `${value}\n`;
    }, `Cannot generate WebAssembly for ${filename}. ${problemCount} problems.\n`);

    throw new Error(errorString);
  }
}
