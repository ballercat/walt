// @flow
import imports from './imports';
import exports_ from './exports';
import globals from './globals';
import functions from './functions';
import start from './start';
import element from './element';
import types from './types';
import code from './code';
import memory from './memory';
import table from './table';
import data from './data';
import name from './name';
import {
  SECTION_TYPE,
  SECTION_IMPORT,
  SECTION_FUNCTION,
  SECTION_MEMORY,
  SECTION_TABLE,
  SECTION_GLOBAL,
  SECTION_EXPORT,
  SECTION_START,
  SECTION_ELEMENT,
  SECTION_CODE,
  SECTION_DATA,
  SECTION_NAME,
} from './codes';

import writer from './writer';

export default {
  type: writer({ type: SECTION_TYPE, label: 'Types', emitter: types }),
  imports: writer({ type: SECTION_IMPORT, label: 'Imports', emitter: imports }),
  function: writer({
    type: SECTION_FUNCTION,
    label: 'Functions',
    emitter: functions,
  }),
  table: writer({ type: SECTION_TABLE, label: 'Table', emitter: table }),
  memory: writer({ type: SECTION_MEMORY, label: 'Memory', emitter: memory }),
  exports: writer({
    type: SECTION_EXPORT,
    label: 'Exports',
    emitter: exports_,
  }),
  globals: writer({ type: SECTION_GLOBAL, label: 'Globals', emitter: globals }),
  start: writer({ type: SECTION_START, label: 'Start', emitter: start }),
  element: writer({
    type: SECTION_ELEMENT,
    label: 'Element',
    emitter: element,
  }),
  code: writer({ type: SECTION_CODE, label: 'Code', emitter: code }),
  data: writer({ type: SECTION_DATA, label: 'Data', emitter: data }),
  name: writer({ type: SECTION_NAME, label: 'Name', emitter: name }),
};
