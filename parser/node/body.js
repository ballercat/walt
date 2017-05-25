const ModuleNode = require('./module');
const FunctionNode = require('./function');
const DeclarationNode = require('./declaration');
const Node = require('./node');

class BodyNode extends Node {
  keyword(value) {
    switch(value) {
      case 'module':
        return new ModuleNode(this.walker, this.context);
      case 'function':
        return new FunctionNode(this.walker, this.context);
      case 'global':
        return new DeclarationNode(this.walker, this.context);
      default:
        return this;
    }
  }
}

module.exports = BodyNode;

