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
  const line = marker.start.line;
  const col = marker.start.col;
  const end = marker.end.col;
  const Line = marker.end.sourceLine;

  const highlight = new Array(end - col + 2)
    .join('^')
    .padStart(marker.start.col - 2, ' ');
  return (
    '\n' +
    Line +
    '\n' +
    highlight +
    ` ${error}` +
    '\n' +
    msg +
    '\n' +
    `  at ${func} (${filename}:${line}:${col})`
  );
}
