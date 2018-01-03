// @flow
import type { TokenType } from "../flow/types";

export default function generateErrorString(
  msg: string,
  error: string,
  token: TokenType,
  Line: string,
  filename: string,
  func: string
): string {
  const { line, col } = token.start;
  const { col: end } = token.end;

  const highlight = new Array(end - col + 1).join("^").padStart(end, " ");
  return `
${Line}
${highlight} ${error}
${msg}
  at ${func} (${filename}:${line}:${col})`;
}
