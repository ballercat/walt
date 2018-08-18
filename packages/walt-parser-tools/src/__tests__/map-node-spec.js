import test from 'ava';
import extend from 'xtend';
import Syntax from 'walt-syntax';
import { mapNode } from '../map-node';

const mockNodeString =
  '{"Type":"BinaryExpression","value":"+","range":[null,{"line":1,"col":8}],"meta":[],"params":[{"Type":"ArraySubscript","value":"[","range":[null,{"line":1,"col":4}],"meta":[],"params":[{"Type":"Identifier","value":"b","range":[{"line":1,"col":0},{"line":1,"col":1}],"meta":[{"payload":0,"type":"global/index"}],"params":[],"type":"i32"},{"Type":"Constant","value":"1","range":[{"line":1,"col":2},{"line":1,"col":3}],"meta":[],"params":[],"type":"i32"}],"type":"i32"},{"Type":"Constant","value":"5","range":[{"line":1,"col":7},{"line":1,"col":8}],"meta":[],"params":[],"type":"i32"}],"type":"i32"}';

test('mapping a node results in a new node', t => {
  const node = JSON.parse(mockNodeString);
  const newNode = mapNode({
    [Syntax.BinaryExpression]: binaryNode => {
      if (binaryNode.value === '+') {
        return extend(binaryNode, { value: '-' });
      }
      return binaryNode;
    },
  })(node);

  t.not(node, newNode);
});

test('wildcards', t => {
  const node = JSON.parse(mockNodeString);

  const newNode = mapNode({
    '*': n => extend(n, {}),
  })(node);

  t.not(node, newNode);
});

test('null nodes', t => {
  const newNode = mapNode({})(null);
  t.is(null, newNode);
});
