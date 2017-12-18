// @flow

// Base Character stream class
class Stream {
  input: string;
  pos: number;
  line: number;
  col: number;
  lines: string[];

  constructor(input: string = "") {
    this.pos = this.line = this.col = 0;
    this.input = input;
    this.lines = input.split("\n");
    this.newLine();
  }

  // Stop parsing and throw a fatal error
  die(reason: string) {
    throw new Error(reason);
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
