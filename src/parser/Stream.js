/**
 * Base Character stream class
 *
 * @author  Arthur Buldauskas <arthurbuldauskas@gmail.com>
 */

class Stream {
  /**
   * @constructor
   *
   * @param {String} input Input to read
   * @throws
   */
  constructor(input) {
    if (input == null || typeof input != 'string')
      this.die(`Invalid input stream in Stream constructor. Expected String,
                instead recieved ${JSON.stringify(input)}`);

    this.pos = this.line = this.col = 0;
    this.input = input;
    this.newLine();
  }

  /**
   * Stop parsing and throw a fatal error
   *
   * @param {String} reason
   * @throws
   */
  die(reason) {
    throw new Error(reason);
  }

  /**
   * Peek at a character at current position
   *
   * @return {String} Character
   */
  peek() {
    return this.input.charAt(this.pos);
  }

  /**
   * Advance to next character in stream
   *
   * @return {String} Character
   */
  next() {
    const char = this.input.charAt(this.pos++);

    if (Stream.eol(char))
      this.newLine();
    else
      this.col++;

    return char;
  }

  /**
   * Begin a new line
   */
  newLine() {
    this.line++;
    this.col = 0;
  }

  /**
   * Is the character an end of line
   *
   * @param {String} char Character
   *
   * @return {Boolean}
   * @static
   */
  static eol(char) {
    return char === '\n';
  }

  /**
   * Is the character an end of file
   *
   * @param {String} char Character
   *
   * @return {Boolean}
   * @static
   */
  static eof(char) {
    return char === '';
  }

  /**
   * Is the charater a whitespace
   *
   * @param {String} char Character
   *
   * @return {Boolean}
   * @static
   */
  static whitespace(char) {
    return char === ' ' || char === "\t" || char === "\v" || char === "\r" || char === "\f";
  }
}

module.exports = Stream;

