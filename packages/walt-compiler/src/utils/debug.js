// @flow
import { sizeof } from 'wasm-types';
import OutputStream from './output-stream';

/**
 * Debug internal OutputStream object. Prints binary (hex) of the wasm binary
 * along with any additional debug information.
 *
 * @kind function
 * @name  debug
 *
 * @param {OutputStream} stream OutputStream instance.
 * @param {number} begin Where to begin printing from. Useful for large binaries (default: `0`)
 * @param {number} end   Where to end pritning. Useful for large binaries.
 */
const debug = (stream: OutputStream, begin: number = 0, end?: number) => {
  let pc = 0;
  return (
    stream.data
      .slice(begin, end)
      .map(({ type, value, debug }) => {
        const pcString = `${pc.toString()} 0x${pc.toString(16)}`
          .padStart(6, ' ')
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

export default debug;
