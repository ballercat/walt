import test from 'ava';
import { compile, prettyPrintNode } from '../../';
import { plugin } from '..';

test('ARC plugin', t => {
  const source = `
  const memory : Memory = { initia: 1 };

  type Node = {
    data: i32,
    left: Node,
    right: Node
  };

  function add(root : Node, data: i32) {
  }

  function test(): i32 {
    let node : Node = {
      data: 0,
      left: null,
      right: null
    };

    add(node, 5);
  }
  `;

  const walt = compile(source, { EXPERIMENTAL_ARC: true });
  console.log(prettyPrintNode(walt.semanticAST));
});
