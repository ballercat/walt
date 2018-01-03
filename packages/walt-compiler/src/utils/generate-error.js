// @flow

export default function generateErrorString(
  msg: string,
  error: string,
  marker: {
    start: { line: number, col: number },
    end: { line: number, col: number },
  },
  Line: string,
  filename: string,
  func: string
): string {
  const { line, col } = marker.start;
  const { col: end } = marker.end;

  const highlight = new Array(end - col + 1).join("^").padStart(end, " ");
  return `
${Line}
${highlight} ${error}
${msg}
  at ${func} (${filename}:${line}:${col})`;
}
