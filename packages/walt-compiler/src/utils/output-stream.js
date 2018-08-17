// @flow
import invariant from 'invariant';
import { encodeSigned, encodeUnsigned } from './leb128';
import { sizeof, set, u8 } from 'wasm-types';

// Used to output raw binary, holds values and types in a large array 'stream'
export default class OutputStream {
  data: Array<any>;
  size: number;

  constructor() {
    // Our data, expand it
    this.data = [];

    // start at the beginning
    this.size = 0;
  }

  push(type: string, value: any, debug: string) {
    let size = 0;
    switch (type) {
      case 'varuint7':
      case 'varuint32':
      case 'varint7':
      case 'varint1': {
        // Encode all of the LEB128 aka 'var*' types
        value = encodeUnsigned(value);
        size = value.length;
        invariant(size, `Cannot write a value of size ${size}`);
        break;
      }
      case 'varint32': {
        value = encodeSigned(value);
        size = value.length;
        invariant(size, `Cannot write a value of size ${size}`);
        break;
      }
      case 'varint64': {
        value = encodeSigned(value);
        size = value.length;
        invariant(size, `Cannot write a value of size ${size}`);
        break;
      }
      default: {
        size = sizeof[type];
        invariant(size, `Cannot write a value of size ${size}, type ${type}`);
      }
    }

    this.data.push({ type, value, debug });
    this.size += size;

    return this;
  }

  // Get the BUFFER, not data array.
  // Returns a new buffer unless one is passed in to be written to.
  buffer(buffer: ArrayBuffer = new ArrayBuffer(this.size)) {
    const view = new DataView(buffer);
    let pc = 0;
    this.data.forEach(({ type, value }) => {
      if (Array.isArray(value)) {
        value.forEach(v => set(u8, pc++, view, v));
      } else {
        set(type, pc, view, value);
        pc += sizeof[type];
      }
    });
    return buffer;
  }

  // Writes source OutputStream into the current buffer
  write(source: ?OutputStream) {
    if (source) {
      this.data = this.data.concat(source.data);
      this.size += source.size;
    }

    return this;
  }
}
