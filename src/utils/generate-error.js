// @flow
import type { Token } from "../flow/types";

export const handleUndefined = (ctx: any) => (identifier: string) => {
  throw ctx.syntaxError(`Undefined variable name ${identifier}`);
};

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
