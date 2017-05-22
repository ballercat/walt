const declaration = require('./declaration');
const assignment = require('./assignment');
const moduleNode = require('./module');
const program = require('./program');

module.exports = {
  declaration,
  assignment,
  module: moduleNode,
  program
};

