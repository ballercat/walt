const declaration = require('./declaration');
const assignment = require('./assignment');
const moduleNode = require('./module');
const body = require('./body');

module.exports = {
  declaration,
  assignment,
  module: moduleNode,
  body
};

