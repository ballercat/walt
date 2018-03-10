// @flow
import { varuint32, varuint7, varint1 } from "../numbers";
import { emitString } from "../string";
import OutputStream from "../../utils/output-stream";
import type { NameSectionType } from "../../generator/flow/types";

const emitModuleName = (name: string): OutputStream => {
  const moduleSubsection = new OutputStream();
  emitString(moduleSubsection, name, `name_len: ${name}`);
  return moduleSubsection;
};

const emit = (nameSection: NameSectionType): OutputStream => {
  const stream = new OutputStream();
  // Name identifier/header as this is a custom section which requires a string id
  emitString(stream, "name", "name_len: name");

  const moduleSubsection = emitModuleName(nameSection.module);
  stream.push(varuint7, 0, "name_type: Module");
  stream.push(varuint32, moduleSubsection.size, "name_payload_len");
  stream.write(moduleSubsection);

  return stream;
};

export default emit;
