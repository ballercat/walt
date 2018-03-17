// @flow
import { u8 } from "wasm-types";
import { varint32, varuint32 } from "../numbers";
import opcode from "../opcode";
import OutputStream from "../../utils/output-stream";
import type { DataSectionType } from "../../generator/flow/types";

const emitDataSegment = (stream, segment) => {
  stream.push(varuint32, 0, "memory index");

  stream.push(u8, opcode.i32Const.code, opcode.i32Const.text);
  stream.push(varint32, segment.offset, `segment offset (${segment.offset})`);
  stream.push(u8, opcode.End.code, "end");
  // Pretty shaky encoding here but okay for now
  // - TODO: encode segment size better this must be read as a Int8 in JS at the moment
  // - TODO: encode strings as a sequence of 4 byte words
  stream.push(varuint32, segment.data.length + 1, segment.data);
  stream.push(varuint32, segment.data.length, segment.data);
  for (let i = 0; i < segment.data.length; i++) {
    stream.push(u8, segment.data.charCodeAt(i), segment.data[i]);
  }
};

export default function emit(dataSection: DataSectionType): OutputStream {
  const stream = new OutputStream();
  stream.push(varuint32, dataSection.length, "entries");
  dataSection.forEach(segment => emitDataSegment(stream, segment));

  return stream;
}
