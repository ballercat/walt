// @flow
export const encodeSigned = (value: number) => {
  const encoding = [];
  while (true) {
    const byte = value & 127;
    value = value >> 7;
    const signbit = byte & 0x40;

    if ((value === 0 && !signbit) || (value === -1 && signbit)) {
      encoding.push(byte);
      break;
    } else {
      encoding.push(byte | 0x80);
    }
  }
  return encoding;
};

export const encodeUnsigned = (value: number) => {
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
};
