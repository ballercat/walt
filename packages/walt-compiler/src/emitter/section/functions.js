// @flow
// Emits function section. For function code emitter look into code.js
import { varuint32 } from '../numbers';
import OutputStream from '../../utils/output-stream';

const emit = (functions: any[]) => {
  functions = functions.filter(func => func !== null);
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'count');

  functions.forEach(index => stream.push(varuint32, index, 'type index'));

  return stream;
};

export default emit;
