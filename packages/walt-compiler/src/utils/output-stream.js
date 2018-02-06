// @flow
import invariant from "invariant";
import { sizeof, set, u8 } from "wasm-types";

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

  push(type: string, value: any, debug: string = "") {
    let size = 0;
    switch (type) {
      case "varuint7":
      case "varuint32":
      case "varint7":
      case "varint1": {
        // Encode all of the LEB128 aka 'var*' types
        value = this.encode(value);
        size = value.length;
        invariant(size, `Cannot write a value of size ${size}`);
        break;
      }
      case "varint32": {
        value = this.encodeSigned(value);
        size = value.length;
        invariant(size, `Cannot write a value of size ${size}`);
        break;
      }
      case "varint64": {
        value = this.encodeSigned(value, 64);
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

  encode(value: number) {
    const encoding = [];
    while (true) {
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

  encodeSigned(value: number, size: number = 32) {
    const encoding = [];
    while (true) {
      const byte = value & 127;
      value = value >>> 7;
      const signbit = byte & 0x40;
      if (value < 0) {
        value = value | (~0 << (size - 7));
      }

      if ((value === 0 && !signbit) || (value === -1 && signbit)) {
        encoding.push(byte);
        break;
      } else {
        encoding.push(byte | 0x80);
      }
    }
    return encoding;
  }

  // Get the BUFFER, not data array. **Always creates new buffer**
  buffer() {
    const buffer = new ArrayBuffer(this.size);
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
