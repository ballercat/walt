// @flow
import { mapNode } from 'walt-parser-tools/map-node';
import walkNode from 'walt-parser-tools/walk-node';

import makeParser from './parser';
import semantics from './semantics';
import validate from './validation';
import generator from './generator';
import emitter from './emitter';

import debug from './utils/debug';
import prettyPrintNode from './utils/print-node';

import { VERSION_1 } from './emitter/preamble';
import type { ConfigType } from './flow/types';
import { stringEncoder, stringDecoder } from './utils/string';
import { makeFragment } from './parser/fragment';

// EXPERIMENTAl
import {
  plugin as UnstableARCPlugin,
  imports as UnstableARCImports,
} from './arc';

export {
  makeParser,
  makeFragment,
  semantics,
  validate,
  generator,
  emitter,
  prettyPrintNode,
  debug,
  stringEncoder,
  stringDecoder,
  walkNode,
  mapNode,
  UnstableARCPlugin,
  UnstableARCImports,
};
export const VERSION = '0.20.0';

// Used for debugging purposes
export const getIR = (source: string, config: ConfigType) => {
  const {
    version = VERSION_1,
    encodeNames = false,
    lines = source.split('\n'),
    filename = 'unknown',
    extensions = [],
  } =
    config || {};

  const parser = makeParser([]);
  const fragment = makeFragment(parser);

  const options = {
    version,
    encodeNames,
    lines,
    filename,
    extensions,
  };

  const ast = parser(source);
  const semanticAST = semantics(ast, [], { ...options, parser, fragment });
  validate(semanticAST, { lines, filename });
  const intermediateCode = generator(semanticAST, options);
  const wasm = emitter(intermediateCode, {
    version,
    encodeNames,
    filename,
    lines,
  });
  return wasm;
};

// Compile with plugins, future default export
export const compile = (source: string, config: ConfigType) => {
  const {
    filename = 'unknown.walt',
    extensions = [],
    linker,
    encodeNames = false,
    EXPERIMENTAL_ARC = false,
  } =
    config || {};

  const options = {
    filename,
    lines: source.split('\n'),
    version: VERSION_1,
    encodeNames,
  };

  if (EXPERIMENTAL_ARC) {
    /* $FlowFixMe */
    options.EXPERIMENTAL_ARC = true;
    /* $FlowFixMe */
    extensions.push(UnstableARCPlugin);
  }

  // Generate plugin instances and sort them by the extended compiler phase
  const plugins = extensions.reduce(
    (acc, plugin) => {
      // Default plugins to a specific to ensure correctness
      const instance = {
        semantics: _ => ({}),
        grammar: () => ({ ParserRules: [] }),
        ...plugin(options),
      };

      acc.grammar.push(instance.grammar);
      acc.semantics.push(instance.semantics);

      return acc;
    },
    {
      grammar: [],
      semantics: [],
    }
  );

  const parser = makeParser(plugins.grammar);
  const fragment = makeFragment(parser);
  // The tagged template literal allows for using nodes directly in the source
  fragment.tag = (input, ...replacements) => {
    const string = input.reduce((a, v, i) => {
      const rep = replacements[i];
      if (rep && typeof rep === 'string') {
        return (a += v + rep);
      }

      if (rep) {
        return (a += v + `$$rep_${i}`);
      }

      return (a += v);
    }, '');

    const node = fragment(string);

    return mapNode({
      Identifier(id) {
        if (id.value.includes('$$rep_')) {
          return replacements[Number(id.value.replace('$$rep_', ''))];
        }
        return id;
      },
    })(node);
  };

  const ast = parser(source);

  const semanticAST = semantics(ast, plugins.semantics, {
    parser,
    fragment,
  });

  // validate(semanticAST, options);

  const intermediateCode = generator(semanticAST, { ...options, linker });
  const wasm = emitter(intermediateCode, options);

  return {
    wasm,
    buffer() {
      return wasm.buffer();
    },
    ast,
    semanticAST,
  };
};
