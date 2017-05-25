class Node {
  constructor(walker, context) {
    this.walker = walker;
    this.context = context || {
      globals: [],
      locals: []
    };
  }
}

module.exports = Node;

