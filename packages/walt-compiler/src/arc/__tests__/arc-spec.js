import test from 'ava';
import { compile, prettyPrintNode, debug } from '../../';
// import { plugin } from '..';

test('ARC plugin', t => {
  const source = `
  const memory : Memory = { initial: 1 };

  type Node = {
    data: i32,
    left: Node,
    right: Node
  };

  function add(root : Node, data: i32) {
  }

  export function test(): i32 {
    let node : Node = {
      data: 0,
      left: null,
      right: null
    };

    // add(node, 5);

    // return node.data;
    return node.data;
  }
  `;

  const walt = compile(source, { encodeNames: true, EXPERIMENTAL_ARC: true });
  // console.log(_debug(walt.wasm));
  console.log(prettyPrintNode(walt.semanticAST));

  const calls = [];
  return WebAssembly.instantiate(walt.buffer(), {
    ARC: {
      __arc_allocate: size => {
        calls.push(`__arc_allocate( ${size} )`);
        return 1024;
      },
      __arc_free: pointer => {
        calls.push(`__arc_free( ${pointer} )`);
      },
    },
  }).then(({ instance }) => {
    instance.exports.test();
    t.snapshot(calls);
  });
});
