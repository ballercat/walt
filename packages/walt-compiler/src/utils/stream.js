// @flow
import { link } from "walt-link";
import path from "path";
import { stringEncoder } from "./string";

const buildStream = link(path.resolve(__dirname, "../walt/utils/stream.walt"));
export const stream = input => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const stringStream = stringEncoder(input);
  stringStream.buffer(memory.buffer);

  return buildStream({
    env: {
      memory,
      // TODO: figure out a nicer way of doing this, currently this is fed into
      // malloc
      MEMORY_OFFSET: stringStream.size,
    },
  }).then(module => {
    const {
      initialize,
      wasmNext,
      wasmPeek,
      wasmColumn,
      wasmLine,
    } = module.instance.exports;
    initialize();

    return {
      next: () => String.fromCodePoint(wasmNext()),
      peek: () => String.fromCodePoint(wasmPeek()),
      get col() {
        return wasmColumn();
      },
      get line() {
        return wasmLine();
      },
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

    if (Stream.eol(char)) {
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
  static eol(char: string): boolean {
    return char === "\n";
  }

  // Is the character an end of file
  static eof(char: string): boolean {
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
