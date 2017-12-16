import imports from "./imports";
import exports from "./exports";
import globals from "./globals";
import functions from "./functions";
import writer from "./writer";
import element from "./element";
import types from "./types";
import code from "./code";
import memory from "./memory";
import {
  SECTION_TYPE,
  SECTION_IMPORT,
  SECTION_FUNCTION,
  SECTION_TABLE,
  SECTION_MEMORY,
  SECTION_GLOBAL,
  SECTION_EXPORT,
  SECTION_START,
  SECTION_ELEMENT,
  SECTION_CODE,
  SECTION_DATA
} from "./codes";

export default {
  type: writer({ type: SECTION_TYPE, label: "Types", emitter: types }),
  imports: writer({ type: SECTION_IMPORT, label: "Imports", emitter: imports }),
  function: writer({
    type: SECTION_FUNCTION,
    label: "Functions",
    emitter: functions
  }),
  memory: writer({ type: SECTION_MEMORY, label: "Memory", emitter: memory }),
  exports: writer({ type: SECTION_EXPORT, label: "Exports", emitter: exports }),
  globals: writer({ type: SECTION_GLOBAL, label: "Globals", emitter: globals }),
  element: writer({
    type: SECTION_ELEMENT,
    label: "Element",
    emitter: element
  }),
  code: writer({ type: SECTION_CODE, label: "Code", emitter: code })
};
