// Custom require setup, babel-register + .walt to strings
const pirates = require('pirates');
const nearley = require('nearley');
const compile = require('nearley/lib/compile');
const generate = require('nearley/lib/generate');
const nearleyGrammar = require('nearley/lib/nearley-language-bootstrapped');

require('babel-register')({
  ignore: [/\.walt/, /\.ne/, 'node_modules'],
});

// AVA has no plugins for loaders. Seems like it's recommended to use pre-compiled
// sources with Webpack. But with a require hook we can transform the walt sources
// to strings just fine.
const matcher = filename => filename.indexOf('.walt') > -1;

pirates.addHook(code => `module.exports = \`${code}\`;`, {
  exts: ['.walt'],
  matcher,
});

// Another one for nearly grammars, gotta love JS
pirates.addHook(
  code => {
    // Parse the grammar source into an AST
    const grammarParser = new nearley.Parser(nearleyGrammar);
    grammarParser.feed(code);
    const grammarAst = grammarParser.results[0];

    // Compile the AST into a set of rules
    const grammarInfoObject = compile(grammarAst, {});
    // Generate JavaScript code from the rules
    const grammarJs = generate(grammarInfoObject, 'grammar');

    return grammarJs;
  },
  { exts: ['.ne'], matcher: filename => filename.indexOf('.ne') > -1 }
);
