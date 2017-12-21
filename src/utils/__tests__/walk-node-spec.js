import Syntax from "../../Syntax";
import walkNode from "../walk-node";

const mockNodeString =
  '{"Type":"BinaryExpression","value":"+","range":[null,{"line":1,"col":8}],"meta":[],"params":[{"Type":"ArraySubscript","value":"[","range":[null,{"line":1,"col":4}],"meta":[],"params":[{"Type":"Identifier","value":"b","range":[{"line":1,"col":0},{"line":1,"col":1}],"meta":[{"payload":0,"type":"global/index"}],"params":[],"type":"i32"},{"Type":"Constant","value":"1","range":[{"line":1,"col":2},{"line":1,"col":3}],"meta":[],"params":[],"type":"i32"}],"type":"i32"},{"Type":"Constant","value":"5","range":[{"line":1,"col":7},{"line":1,"col":8}],"meta":[],"params":[],"type":"i32"}],"type":"i32"}';

test("nodes are walked and callbacks are called for types", () => {
  const node = JSON.parse(mockNodeString);
  let hasBinary = false;
  walkNode({
    [Syntax.BinaryExpression]: () => (hasBinary = true)
  })(node);
  expect(hasBinary).toBe(true);
});

test("wildcards are called for all nodes", () => {
  const node = JSON.parse(mockNodeString);
  const expectedTypes = [
    Syntax.BinaryExpression,
    Syntax.ArraySubscript,
    Syntax.Identifier,
    Syntax.Constant,
    Syntax.Constant
  ];
  const walkedTypes = [];

  walkNode({
    "*": n => walkedTypes.push(n.Type)
  })(node);

  expect(walkedTypes).toEqual(expectedTypes);
});

test("nodes can be patched", () => {
  const node = JSON.parse(mockNodeString);
  walkNode({
    [Syntax.Constant]: (constNode, patch) => {
      if (constNode.value === "5") {
        patch({
          ...constNode,
          value: 42
        });
      }
    }
  })(node);

  expect(node).toMatchSnapshot();
});
