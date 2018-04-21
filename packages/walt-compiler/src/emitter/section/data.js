// @flow
import { u8, u32 } from "wasm-types";
import { varint32, varuint32 } from "../numbers";
import opcode from "../opcode";
import OutputStream from "../../utils/output-stream";
import type { DataSectionType } from "../../generator/flow/types";

const emitDataSegment = (stream, segment) => {
  stream.push(varuint32, 0, "memory index");

  const { offset, data } = segment;

  stream.push(u8, opcode.i32Const.code, opcode.i32Const.text);
  stream.push(varint32, offset, `segment offset (${offset})`);
  stream.push(u8, opcode.End.code, "end");

  stream.push(varuint32, data.size, "segment size");
  stream.write(data);
};

const encodeDataLength = (stream, length) => {
  stream.push(varuint32, 0, "memory index");
  const offset = 0;
  const data = new OutputStream();
  data.push(u32, length, "dataLength");

  stream.push(u8, opcode.i32Const.code, opcode.i32Const.text);
  stream.push(varint32, offset, `segment offset (${offset})`);
  stream.push(u8, opcode.End.code, "end");

  stream.push(varuint32, data.size, "");
  stream.write(data);
};

export default function emit(dataSection: DataSectionType): OutputStream {
  const stream = new OutputStream();
  stream.push(varuint32, dataSection.length, "entries");

  // push an entry for the total size of the data section
  // const lastEntry = dataSection[dataSection.length - 1];
  // const totalDataLength = 4 + lastEntry.offset + lastEntry.data.size;
  // encodeDataLength(stream, totalDataLength);
  console.log(dataSection);

  for (let i = 0, len = dataSection.length; i < len; i++) {
    const segment = dataSection[i];
    emitDataSegment(stream, segment);
  }

  return stream;
}
