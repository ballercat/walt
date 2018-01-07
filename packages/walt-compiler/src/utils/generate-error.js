// @flow

export default function generateErrorString(
  msg: string,
  error: string,
  marker: {
    start: { sourceLine: string, line: number, col: number },
    end: { sourceLine: string, line: number, col: number },
  },
  filename: string,
  func: string
): string {
  const { sourceLine: Line, line, col } = marker.start;
  const { col: end } = marker.end;

  const highlight = new Array(end - col + 1).join("^").padStart(end, " ");
  return `
${Line}
${highlight} ${error}
${msg}
  at ${func} (${filename}:${line}:${col})`;
}
