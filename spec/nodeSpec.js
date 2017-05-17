require('jasmine2-custom-message');
const checks = require('./nodeChecks');
const declaration = require('./../parser/node/declaration');
const assignment = require('./../parser/node/assignment');
const { tokenize } = require('./specUtils');

const mapNodeCheck = (cb, nodeType) => {
  Object.keys(nodeType).map(text => cb(tokenize(text), text, nodeType[text]));
};

describe('Node', () => {

  describe('declaration', () => {

    xit('parses tokens', () => {
      mapNodeCheck((tokens, text, is) => {
        const result = tokens.reduce(
          (acc, token) => typeof acc === 'function' ? acc(token) : acc,
          declaration);
        since(`should parse ${text}`).expect(result !== null).toBe(is);
      }, checks.declaration);
    });
  });

  describe('assignment', () => {

    xit('parses tokens', () => {
      mapNodeCheck((tokens, text, is) => {
        const result = tokens.reduce(
          (acc, token) => typeof acc === 'function' ? acc(token) : acc,
          declaration);
        since(`should parse ${text}`).expect(result !== null).toBe(is);
      }, checks.assignment);
    });
  });

});

