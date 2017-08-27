import invariant from 'invariant';
import { sizeof, set, u8 } from 'wasm-types';

// Used to output raw binary, holds values and types in a large array 'stream'
export default class OutputStream {
  constructor() {
    // Our data, expand it
    this.data = [];

    // start at the beginning
    this.size = 0;
  }

  push(type, value, debug = '') {
    let size = 0;
    switch(type) {
      case 'varuint7':
      case 'varuint32':
      case 'varint7':
      case 'varint1': {
        // Encode all of the LEB128 aka 'var*' types
        value = this.encode(value);
        size = value.length;
        invariant(size, `Cannot write a value of size ${size}`);
        break;
      }
      default: {
        size = sizeof[type];
        invariant(size, `Cannot write a value of size ${size}, type ${type}`);
      }
    }

    this.data.push({type, value, debug});
    this.size += size;

    return this;
  }

  encode(value) {
    const encoding = [];
    while(true) {
      const i = value & 127;
      value = value >>> 7;
      if (value === 0) {
        encoding.push(i);
        break;
      }

      encoding.push(i | 0x80);
    }

    return encoding;
  }

  // Get the BUFFER, not data array. **Always creates new buffer**
  buffer() {
    const buffer = new ArrayBuffer(this.size);
    const view = new DataView(buffer);
    let pc = 0;
    this.data.forEach(({type, value}) => {
      if (Array.isArray(value)) {
        value.forEach((v, i) => set(u8, pc++, view, v));
      } else {
        set(type, pc, view, value);
        pc += sizeof[type];
      }
    });
    return buffer;
  }

  debug(begin = 0, end) {
    let pc = 0;
    return this.data.slice(begin, end).map(({ type, value, debug }) => {
      const pcString = (pc).toString().padEnd((this.data.length).toString().length + 1);
      let valueString;
      if (Array.isArray(value))
        valueString = value.map(v => (v).toString(16)).join().padStart(12);
      else
        valueString = (value).toString(16).padStart(12);
      const out = `${pcString}: ${valueString} ; ${debug}`;
      pc += sizeof[type] || value.length;
      return out;
    }).join('\n') + "\n ============ fin =============";
  }

  // Writes source OutputStream into the current buffer
  write(source) {
    if (source) {
      this.data = this.data.concat(source.data);
      this.size += source.size;
    }

    return this;
  }
}

