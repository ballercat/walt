// @flow
import type { Token } from "../flow/types";

export const handleUndefined = (ctx: any) => (identifier: string) => {
  throw ctx.syntaxError(`Undefined variable name ${identifier}`);
};

export default function generateErrorString(
  msg: string,
  error: string,
  token: Token,
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
