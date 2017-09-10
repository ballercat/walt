// @flow
import { getType, generateImport, generateElement } from './generator';
import { EXTERN_TABLE } from '../emitter/external_kind';
import type { Node, TypeNode } from './node';

const generateErrorString = (
  msg:string,
  error: string,
  line:number,
  col: number,
  filename: string,
  func: string
) => {
  return `${error}. ${msg}
    at ${func} (${filename}:${line}:${col})`;
}

export const findTypeIndex = (node: TypeNode, Types: TypeNode[]): number => {
  return Types.findIndex(t => {
    const paramsMatch = t.params.reduce(
      (a, v, i) => node.params[i] && a && v === getType(node.params[i].type),
      true
    );

    const resultMatch = t.result == node.result || t.result === getType(node.result.type);

    return paramsMatch && resultMatch;
  });
}

/**
 * Context is used to parse tokens into an AST and IR used by the generator.
 * Originally the parser was a giant class and the context was the 'this' pointer.
 * Maintaining a monolithic parser is rather difficult so it was broken up into a
 * collection of self-contained parsers for each syntactic construct. The context
 * is passed around between each one to generate the desired tree
 */
class Context {
  token: { value: string };

  constructor(options = {
    body: [],
    diAssoc: 'right',
    stream: null,
    token: null,
    globalSymbols: {},
    localSymbols: {},
    globals: [],
    functions: []
  }) {
    Object.assign(this, options);

    this.Program = { body: [] };
    // Setup keys needed for the emiter
    this.Program.Types = [];
    this.Program.Code = [];
    this.Program.Exports = [];
    this.Program.Imports = [];
    this.Program.Globals = [];
    this.Program.Element = [];
    this.Program.Functions = [];
  }

  syntaxError(msg: string, error: any) {
    const { line, col } = this.token.start;
    return new SyntaxError(
      generateErrorString(
        msg,
        error || '',
        line,
        col,
        this.filename || 'unknown',
        (this.func && this.func.id) || 'global'
      )
    );
  }

  unexpectedValue(value) {
    return this.syntaxError(
      `Value   : ${this.token.value}
      Expected: ${Array.isArray(value) ? value.join('|') : value}`,
      'Unexpected value'
    );
  }

  unexpected(token) {
    return this.syntaxError(
      `Expected: ${Array.isArray(token) ? token.join(' | ') : token}`,
      `Unexpected token ${this.token.type}`
    );
  }

  unknown({ value }) {
    return this.syntaxError('Unknown token', value);
  }

  unsupported() {
    return this.syntaxError('Language feature not supported', this.token.value);
  }

  expect(value, type) {
    const token = this.token;
    if (!this.eat(value, type)) {
      throw value ? this.unexpectedValue(value) : this.unexpected(type);
    }

    return token;
  }

  next() {
    this.token = this.stream.next();
  }

  eat(value, type) {
    if (value) {
      if (value.includes(this.token.value)) {
        this.next();
        return true;
      }
      return false;
    }

    if (this.token.type === type) {
      this.next();
      return true;
    }

    return false;
  }

  startNode(token: any = this.token): Node {
    return { start: token.start, range: [token.start] };
  }

  endNode(node, Type) {
    const token = this.token || this.stream.last();
    return Object.assign(
      node,
      {
        Type,
        end: token.end,
        range: node.range.concat(token.end)
      });
  }

  writeFunctionPointer(functionIndex: number): void {
    if (!this.Program.Element.length) {
      this.Program.Imports.push.apply(
        this.Program.Imports,
        generateImport({
          module: 'env',
          fields: [{
            id: 'table',
            kind: EXTERN_TABLE
          }]
        }));
    }

    const exists = this.Program.Element.find(
      n => n.functionIndex === functionIndex
    );
    if (exists == null) {
      this.Program.Element.push(generateElement(functionIndex));
    }
  }
}

export default Context;

