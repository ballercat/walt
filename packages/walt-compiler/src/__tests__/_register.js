// Custom require setup, babel-register + .walt to strings
const pirates = require("pirates");

require("babel-register")({
  ignore: [/\.walt/, "node_modules"],
});

// AVA has no plugins for loaders. Seems like it's recommended to use pre-compiled
// sources with Webpack. But with a require hook we can transform the walt sources
// to strings just fine.
const matcher = filename => filename.indexOf(".walt") > -1;

pirates.addHook(code => `module.exports = \`${code}\`;`, {
  exts: [".walt"],
  matcher,
});
