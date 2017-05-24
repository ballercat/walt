const ModuleNode = require('./module');
const FunctionNode = require('./function');
const Node = require('./node');

class BodyNode extends Node {
  keyword(value) {
    switch(value) {
      case 'module':
        return new ModuleNode();
      case 'function':
        return new FunctionNode();
      default:
        return this;
    }
  }
}

module.exports = BodyNode;

