/**
 * A very basic trie with functional,recursive search
 */
const fsearch = node => {
  const next = char => {
    if (node && node.children[char]) {
      return fsearch(node.children[char]);
    }

    return null;
  };

  next.leaf = node.leaf;

  return next;
};

class TokenTrie {
  constructor (tokens) {
    this.root = {
      token: null,
      children: [],
      leaf: false
    };

    tokens.map(token => this.add(token));
    this.fsearch = fsearch(this.root);
  }

  add(token) {
    let current = this.root;
    let leaf = token.slice(0, 1);

    token = token.slice(1);

    while(typeof current.children[leaf.type] !== 'undefined') {
      current = current.children[leaf.type];
      leaf = token.slice(0, 1);
      token = token.slice(1);
    }

    while(leaf) {
      const node = {
        token: leaf,
        children: {},
        leaf: false
      };

      current.children[leaf.type] = node;
      current = node;
      leaf = token.slice(0, 1);
      token = token.slice(1);
    }

    current.leaf = true;
  }
}

module.exports = TokenTrie;

