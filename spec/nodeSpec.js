const x = require('jasmine2-custom-message');
const checks = require('./nodeChecks');
const nodes = require('./../parser/node');
const { tokenize } = require('./specUtils');

const mapNodeCheck = (cb, nodeType) => {
  Object.keys(nodeType).map(text => cb(tokenize(text), text, nodeType[text]));
};

const testNode = name => xit(
  name,
  () => {
    mapNodeCheck(
      (tokens, text, is) => {
        const result = tokens.reduce(
          (acc, token) => typeof acc === 'function' ? acc(token) : acc,
          nodes[name]
        );
        since(`should parse ${text}`).expect(result !== null).toBe(is);
      },
      checks[name]
    );
  }
);

describe('Node', () => {
  // These can be un-rolled while implementing a single spec.
  Object.keys(checks).map(testNode);
});

