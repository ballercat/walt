// @flow
import { u8 } from 'wasm-types';
import { varuint32 } from '../numbers';
import OutputStream from '../../utils/output-stream';

const writer = ({
  type,
  label,
  emitter,
}: {
  type: number,
  label: string,
  emitter: any => OutputStream,
}) => (ast: any): ?OutputStream => {
  const field = ast[label];
  if (!field || (Array.isArray(field) && !field.length)) {
    return null;
  }

  const stream = new OutputStream().push(u8, type, label + ' section');
  const entries = emitter(field);

  stream.push(varuint32, entries.size, 'size');
  stream.write(entries);

  return stream;
};

export default writer;
