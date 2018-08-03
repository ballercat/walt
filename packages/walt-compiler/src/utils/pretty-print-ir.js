// @flow
import type { IntermediateOpcodeType } from '../generator/flow/types';

export default function prettyPrint(IRList: IntermediateOpcodeType[]): string {
  return [
    '------ Intermediate Representation ------',
    `Stats: ${IRList.length} nodes`,
    '-----------------------------------------',
    '|   Opcode       |        Parameters    |',
    '|---------------------------------------|',
    ...IRList.map(
      ({ kind: { name }, params }) =>
        `| ${name.padEnd(14)} | ${params.join(',').padEnd(20)} |`
    ),
    '----------------- End -------------------',
  ].join('\n');
}
