// @flow
import parser from "./parser";
import emit from "./emitter";
import codeGenerator from "./generator";
import semanticAnalyzer from "./semantics";
import astValidator from "./validation";
import _debug from "./utils/debug";
import printNode from "./utils/print-node";

export const debug = _debug;
export const prettyPrintNode = printNode;
export const semantics = semanticAnalyzer;
export const generator = codeGenerator;
export const validate = astValidator;
export const emitter = emit;

export const buildProgram = (source: string) => {
  const ast = parser(source);
  const semanticAST = semantics(ast);
  console.log(printNode(semanticAST));
  validate(
    semanticAST,
    // this will eventually be a config
    {
      lines: source ? source.split("\n") : [],
      filename: "walt-source",
    }
  );
  return generator(semanticAST);
};

// Used for deugging purposes
export const getIR = (source: string) => {
  const ast = parser(source);
  const semanticAST = semantics(ast);
  // console.log(printNode(semanticAST));
  validate(
    semanticAST,
    // this will eventually be a config
    {
      lines: source ? source.split("\n") : [],
      filename: "walt-source",
    }
  );
  const intermediateCode = generator(semanticAST);
  const wasm = emitter(intermediateCode);
  // console.log(debug(wasm));
  return wasm;
};

// Compiles a raw binary wasm buffer
export default function compileWalt(source: string) {
  const wasm = getIR(source);
  return wasm.buffer();
}
