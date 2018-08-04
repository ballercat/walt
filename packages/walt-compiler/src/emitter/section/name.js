// @flow
import { varuint32, varuint7 } from '../numbers';
import { emitString } from '../string';
import OutputStream from '../../utils/output-stream';
import type { NameSectionType } from '../../generator/flow/types';

// Emit Module name subsection
const emitModuleName = (name: string): OutputStream => {
  const moduleSubsection = new OutputStream();
  emitString(moduleSubsection, name, `name_len: ${name}`);
  return moduleSubsection;
};

// Emit Functions subsection
const emitFunctionNames = (
  names: Array<{ index: number, name: string }>
): OutputStream => {
  const stream = new OutputStream();

  stream.push(varuint32, names.length, `count: ${String(names.length)}`);
  names.forEach(({ index, name }) => {
    stream.push(varuint32, index, `index: ${String(index)}`);
    emitString(stream, name, `name_len: ${name}`);
  });

  return stream;
};

// Emit Locals subsection
const emitLocals = (
  localsMap: Array<{
    index: number,
    locals: Array<{ index: number, name: string }>,
  }>
): OutputStream => {
  const stream = new OutputStream();

  // WebAssembly Binary Encoding docs are not the best on how this should be encoded.
  // This is pretty much lifted from wabt C++ source code. First comes the number
  // or functions, where each function is a header of a u32 function index followed
  // by locals + params count with each local/param encoded as a name_map
  stream.push(
    varuint32,
    localsMap.length,
    `count: ${String(localsMap.length)}`
  );
  localsMap.forEach(({ index: funIndex, locals }) => {
    stream.push(varuint32, funIndex, `function index: ${String(funIndex)}`);
    stream.push(
      varuint32,
      locals.length,
      `number of params and locals ${locals.length}`
    );
    locals.forEach(({ index, name }) => {
      stream.push(varuint32, index, `index: ${String(index)}`);
      emitString(stream, name, `name_len: ${name}`);
    });
  });

  return stream;
};

// Emit the Name custom section.
const emit = (nameSection: NameSectionType): OutputStream => {
  const stream = new OutputStream();
  // Name identifier/header as this is a custom section which requires a string id
  emitString(stream, 'name', 'name_len: name');

  // NOTE: Every subsection header is encoded here, not in the individual subsection
  // logic.
  const moduleSubsection = emitModuleName(nameSection.module);
  stream.push(varuint7, 0, 'name_type: Module');
  stream.push(varuint32, moduleSubsection.size, 'name_payload_len');
  stream.write(moduleSubsection);

  const functionSubsection = emitFunctionNames(nameSection.functions);
  stream.push(varuint7, 1, 'name_type: Function');
  stream.push(varuint32, functionSubsection.size, 'name_payload_len');
  stream.write(functionSubsection);

  const localsSubsection = emitLocals(nameSection.locals);
  stream.push(varuint7, 2, 'name_type: Locals');
  stream.push(varuint32, localsSubsection.size, 'name_payload_len');
  stream.write(localsSubsection);

  return stream;
};

export default emit;
