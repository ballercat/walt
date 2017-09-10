import type { Token } from '../flow/types';
import chalk from 'chalk';

const generateErrorString = (
  msg:string,
  error: string,
  token: Token,
  Line: string,
  filename: string,
  func: string
) => {
  const { line, col } = token.start;
  const { col: end } = token.end;

  const highlight = chalk.red(new Array(end - col + 1).join('^').padStart(end, ' '));
  return (
`
${Line}
${highlight} ${error}
${msg}
  at ${func} (${filename}:${line}:${col})`
);
}

export default generateErrorString;

