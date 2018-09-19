// Custom require setup, babel-register + .walt to strings
const nearley = require('nearley');
const compile = require('nearley/lib/compile');
const nearleyGrammar = require('nearley/lib/nearley-language-bootstrapped');
const generate = require('nearley/lib/generate');

function dedentFunc(func) {
  let lines = func.toString().split(/\n/);

  if (lines.length === 1) {
    return [lines[0].replace(/^\s+|\s+$/g, '')];
  }

  let indent = null;
  let tail = lines.slice(1);
  for (let i = 0; i < tail.length; i++) {
    let match = /^\s*/.exec(tail[i]);
    if (match && match[0].length !== tail[i].length) {
      if (indent === null || match[0].length < indent.length) {
        indent = match[0];
      }
    }
  }

  if (indent === null) {
    return lines;
  }

  return lines.map(function dedent(line) {
    if (line.slice(0, indent.length) === indent) {
      return line.slice(indent.length);
    }
    return line;
  });
}

function tabulateString(string, indent, options) {
  let lines;
  if (Array.isArray(string)) {
    lines = string;
  } else {
    lines = string.toString().split('\n');
  }

  options = options || {};
  const tabulated = lines
    .map(function addIndent(line, i) {
      let shouldIndent = true;

      if (i === 0 && !options.indentFirst) {
        shouldIndent = false;
      }

      if (shouldIndent) {
        return indent + line;
      }
      return line;
    })
    .join('\n');

  return tabulated;
}

function serializeSymbol(s) {
  if (s instanceof RegExp) {
    return s.toString();
  } else if (s.token) {
    return s.token;
  }
  return JSON.stringify(s);
}

function serializeRule(rule, builtinPostprocessors) {
  let ret = '{';
  ret += '"name": ' + JSON.stringify(rule.name);
  ret += ', "symbols": [' + rule.symbols.map(serializeSymbol).join(', ') + ']';
  if (rule.postprocess) {
    if (rule.postprocess.builtin) {
      rule.postprocess = builtinPostprocessors[rule.postprocess.builtin];
    }
    ret +=
      ', "postprocess": ' +
      tabulateString(dedentFunc(rule.postprocess), '        ', {
        indentFirst: false,
      });
  }
  ret += '}';
  return ret;
}

function serializeRules(rules, builtinPostprocessors) {
  return (
    '[\n    ' +
    rules
      .map(function(rule) {
        return serializeRule(rule, builtinPostprocessors);
      })
      .join(',\n    ') +
    '\n]'
  );
}

function customGenerator(parser) {
  let output = `// Custom Walt Grammar Generator
function id(x) { return x[0]; }

export default function grammar() {
  ${parser.body.join('\n')}

  return {
    Lexer: ${parser.config.lexer},
    ParserRules: ${serializeRules(
      parser.rules,
      generate.javascript.builtinPostprocessors
    )},
    ParserStart: ${JSON.stringify(parser.start)}
  };
}
`;

  return output;
}

module.exports = function nearleyGramar(_options = {}) {
  return {
    name: 'nearley',
    transform(code, file) {
      if (file.slice(-3) !== '.ne') {
        return null;
      }

      // Parse the grammar source into an AST
      const grammarParser = new nearley.Parser(nearleyGrammar);
      grammarParser.feed(code);
      const grammarAst = grammarParser.results[0];

      // Compile the AST into a set of rules
      const grammarInfoObject = compile(grammarAst, { file });

      return {
        code: customGenerator(grammarInfoObject, 'grammar'),
        map: { mappings: '' },
      };
    },
  };
}
