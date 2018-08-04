// @flow
import { varuint32 } from '../numbers';
import OutputStream from '../../utils/output-stream';

export default function emitTables(start: number[]) {
  const stream = new OutputStream();

  if (start.length) {
    stream.push(varuint32, start[0], 'start function');
  }

  return stream;
}
