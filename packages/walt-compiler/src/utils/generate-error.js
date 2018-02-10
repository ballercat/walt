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
  const { line, col } = marker.start;
  const { col: end } = marker.end;
  const Line = (() => {
    if (marker.start.sourceLine !== marker.end.sourceLine) {
      return marker.start.sourceLine + "\n" + marker.end.sourceLine;
    }
    return marker.end.sourceLine;
  })();

  const highlight = new Array(end - col + 1).join("^").padStart(end, " ");
  return (
    "\n" +
    Line +
    "\n" +
    highlight +
    ` ${error}` +
    "\n" +
    msg +
    "\n" +
    `  at ${func} (${filename}:${line}:${col})`
  );
}
