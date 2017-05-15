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

class Trie {
  constructor (words) {
    this.root = {
      char: '',
      children: {},
      leaf: false
    };

    words.map(word => this.add(word));
    this.fsearch = fsearch(this.root);
  }

  add(word) {
    let current = this.root;
    let char = word.slice(0, 1);

    word = word.slice(1);

    while(
      typeof current.children[char] !== 'undefined' &&
      char.length > 0) {
      current = current.children[char];
      char = word.slice(0, 1);
      word = word.slice(1);
    }

    while(char.length > 0) {
      const node = {
        char,
        children: {},
        leaf: false
      };

      current.children[char] = node;
      current = node;
      char = word.slice(0, 1);
      word = word.slice(1);
    }

    current.leaf = true;
  }
}

module.exports = Trie;

