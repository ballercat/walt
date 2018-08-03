// @flow
import { sizeof } from 'wasm-types';
import OutputStream from './output-stream';

const _debug = (stream: OutputStream, begin: number = 0, end?: number) => {
  let pc = 0;
  return (
    stream.data
      .slice(begin, end)
      .map(({ type, value, debug }) => {
        const pcString = pc
          .toString(16)
          .padStart(8, '0')
          .padEnd(stream.data.length.toString().length + 1);
        let valueString;
        if (Array.isArray(value)) {
          valueString = value
            .map(v => v.toString(16))
            .join()
            .padStart(16);
        } else {
          valueString = value.toString(16).padStart(16);
        }
        const out = `${pcString}: ${valueString} ; ${debug}`;
        pc += sizeof[type] || value.length;
        return out;
      })
      .join('\n') + '\n ============ fin ============='
  );
};

export default _debug;
