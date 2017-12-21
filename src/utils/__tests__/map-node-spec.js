import Syntax from "../../Syntax";
import mapNode from "../map-node";

const mockNodeString =
  '{"Type":"BinaryExpression","value":"+","range":[null,{"line":1,"col":8}],"meta":[],"params":[{"Type":"ArraySubscript","value":"[","range":[null,{"line":1,"col":4}],"meta":[],"params":[{"Type":"Identifier","value":"b","range":[{"line":1,"col":0},{"line":1,"col":1}],"meta":[{"payload":0,"type":"global/index"}],"params":[],"type":"i32"},{"Type":"Constant","value":"1","range":[{"line":1,"col":2},{"line":1,"col":3}],"meta":[],"params":[],"type":"i32"}],"type":"i32"},{"Type":"Constant","value":"5","range":[{"line":1,"col":7},{"line":1,"col":8}],"meta":[],"params":[],"type":"i32"}],"type":"i32"}';

test("mapping a node results in a new node", () => {
  const node = JSON.parse(mockNodeString);
  const newNode = mapNode({
    [Syntax.BinaryExpression]: binaryNode => {
      if (binaryNode.value === "+") {
        return {
          ...binaryNode,
          value: "-"
        };
      }
      return binaryNode;
    }
  })(node);

  expect(node).not.toBe(newNode);
});

test("wildcards", () => {
  const node = JSON.parse(mockNodeString);

  const newNode = mapNode({
    "*": n => ({ ...n })
  })(node);

  expect(node).not.toBe(newNode);
});

test("null nodes", () => {
  const newNode = mapNode({})(null);
  expect(null).toBe(newNode);
});
