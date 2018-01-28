// @flow

export const handleUndefinedField = (ctx: any) => (
  type: string,
  field: string
) => {
  const userType = ctx.userTypes[type];
  const keyTypes = userType.meta.find(k => k.type === "object/key-types");
  const additional =
    keyTypes &&
    `
You're trying to access field ${field} but the ${type} definitions looks like:

${JSON.stringify(keyTypes.payload, null, 2)}
    
Hint: It looks like an object is missing the field ${field}`;

  throw ctx.typeError(
    `Undefined field: ${field} in object of type ${type}`,
    additional
  );
};

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
