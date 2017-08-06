import { set, get } from 'wasm-types';

export default class OutputStream {
  constructor() {
    this.buffer = new ArrayBuffer(256);
    this.view = new DataView(this.buffer);
  }

  set(type, index, value) {
    set(type, index, this.view, value);
  }

  get(type, index) {
    return get(type, index, this.view);
  }
}

