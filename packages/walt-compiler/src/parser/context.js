/**
 * Context is used to parse tokens into the base AST.
 * Originally the parser was a giant class and the context was the 'this' pointer.
 * Maintaining a monolithic parser is rather difficult so it was broken up into a
 * collection of self-contained parsers for each syntactic construct. The context
 * is passed around between each one to generate the desired tree
 */

// @flow
import generateErrorString from "../utils/generate-error";
import type { TokenStream } from "../utils/token-stream";
import type { TokenType, NodeType } from "../flow/types";

export default class Context {
  token: TokenType;
  stream: TokenStream;
  filename: string;
  lines: string[];

  constructor({
    stream,
    token,
    lines,
  }: {
    stream: TokenStream,
    token: TokenType,
    lines: string[],
  }) {
    this.token = token;
    this.stream = stream;
    this.lines = lines;
  }

  syntaxError(msg: string, error: any) {
    const functionId = "unknown";
    return new SyntaxError(
      generateErrorString(
        msg,
        error || "",
        this.token,
        this.filename || "unknown",
        functionId
      )
    );
  }

  unexpectedValue(value: string[] | string) {
    return this.syntaxError(
      `Expected: ${Array.isArray(value) ? value.join("|") : value}`,
      "Unexpected value"
    );
  }

  unexpected(token?: string) {
    return this.syntaxError(
      `Expected: ${
        Array.isArray(token) ? token.join(" | ") : JSON.stringify(token)
      }`,
      `Unexpected token ${this.token.type}`
    );
  }

  unknown({ value }: { value: string }) {
    return this.syntaxError("Unknown token", value);
  }

  unsupported() {
    return this.syntaxError("Language feature not supported", this.token.value);
  }

  expect(value: string[] | null, type?: string): TokenType {
    const token = this.token;
    if (!this.eat(value, type)) {
      throw value ? this.unexpectedValue(value) : this.unexpected(type);
    }

    return token;
  }

  next() {
    this.token = this.stream.next();
  }

  eat(value: string[] | null, type?: string): boolean {
    if (this.token == null) {
      return false;
    }

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

  startNode(token: any = this.token || {}): NodeType {
    return {
      Type: "",
      value: token.value,
      range: [token.start],
      meta: {},
      params: [],
      type: null,
    };
  }

  endNode(node: NodeType, Type: string): NodeType {
    const token = this.token || this.stream.last() || {};
    return {
      ...node,
      Type,
      range: node.range.concat(token.end),
    };
  }

  makeNode(node: any, syntax: string): NodeType {
    return this.endNode(
      {
        ...this.startNode(),
        ...node,
      },
      syntax
    );
  }
}
