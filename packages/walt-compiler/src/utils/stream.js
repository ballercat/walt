// @flow
import { link } from "walt-link";
import path from "path";
import { stringEncoder } from "./string";
import {
  mapNode,
  walkNode,
  parser,
  semantics,
  validate,
  emitter,
  generator,
  prettyPrintNode,
} from "..";

declare var WebAssembly: any;
export const eol = (char: string) => char === "\n";

export const async = (input: string) => {
  const buildStream = link(
    path.resolve(__dirname, "../walt/utils/stream.walt"),
    {},
    {
      mapNode,
      walkNode,
      parser,
      semantics,
      validate,
      emitter,
      generator,
      prettyPrintNode,
    }
  );
  const memory = new WebAssembly.Memory({ initial: 1 });
  const stringStream = stringEncoder(input);
  stringStream.buffer(memory.buffer);

  const withText = text => i => console.log(text, i);

  return buildStream({
    env: {
      memory,
      STRING_BYTE_LENGTH: stringStream.size,
      log: withText("logger - "),
      start: withText("start - "),
    },
  }).then(module => {
    const {
      _next,
      _peek,
      _column,
      _line,
      whitespace,
    } = module.instance.exports;

    return {
      next: () => String.fromCodePoint(_next()),
      peek: () => String.fromCodePoint(_peek()),
      get col() {
        return _column();
      },
      get line() {
        return _line();
      },
      eof(char) {
        return char === "" || char === "\0";
      },
      lines: input.split("\n"),
      whitespace,
    };
  });
};

// Base Character stream class
class Stream {
  input: string;
  pos: number;
  line: number;
  col: number;
  lines: string[];

  constructor(input: string) {
    this.pos = this.line = this.col = 0;
    this.input = input;
    this.lines = input.split("\n");
    this.newLine();
  }

  // Peek at a character at current position
  peek(): string {
    return this.input.charAt(this.pos);
  }

  // Advance to next character in stream
  next(): string {
    const char = this.input.charAt(this.pos++);

    if (this.eol(char)) {
      this.newLine();
    } else {
      this.col++;
    }

    return char;
  }

  // Begin a new line
  newLine() {
    this.line++;
    this.col = 0;
  }

  // Is the character an end of line
  eol(char: string): boolean {
    return char === "\n";
  }

  // Is the character an end of file
  eof(char: string): boolean {
    return char === "";
  }

  // Is the charater a whitespace
  static whitespace(char: string): boolean {
    return (
      char === "\n" ||
      char === " " ||
      char === "\t" ||
      char === "\v" ||
      char === "\r" ||
      char === "\f"
    );
  }
}

export default Stream;
