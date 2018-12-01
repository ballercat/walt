import test from 'ava';
import { compile, prettyPrintNode } from '../../';
// import { plugin } from '..';

test('ARC plugin', _t => {
  const source = `
  const memory : Memory = { initia: 1 };

  type Node = {
    data: i32,
    left: Node,
    right: Node
  };

  function add(root : Node, data: i32) {
  }

  export function test(): i32 {
    // let node : Node = {
    //   data: 0,
    //   left: null,
    //   right: null
    // };
    let node : Node = {};

    // add(node, 5);

    // return node.data;
    return (node : i32);
  }
  `;

  const walt = compile(source, { encodeNames: true, EXPERIMENTAL_ARC: true });
  // console.log(debug(walt.wasm));
  console.log(prettyPrintNode(walt.semanticAST));

  return WebAssembly.instantiate(walt.buffer(), {
    ARC: {
      __arc_allocate: size => {
        return size;
      },
    },
  }).then(({ instance }) => {
    console.log(instance.exports);
    console.log(instance.exports.test());
  });
});
