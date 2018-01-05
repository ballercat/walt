// @flow
import Syntax from "../Syntax";
import curry from "curry";
import walkNode from "../utils/walk-node";

export default curry(function mapAssignment(options, node, mapChildren) {
  const [lhs, rhs] = node.params;

  // id = { <param>: <value> };
  if (rhs && rhs.Type === Syntax.ObjectLiteral) {
    const params = [];

    walkNode({
      [Syntax.Pair]: (pair, _) => {
        const [property, value] = pair.params;
        params.push({
          ...lhs,
          Type: Syntax.MemoryAssignment,
          params: [
            { ...lhs, Type: Syntax.ArraySubscript, params: [lhs, property] },
            value,
          ],
        });
      },
    })(rhs);

    return {
      ...lhs,
      Type: Syntax.Block,
      // We just created a bunch of MemoryAssignment nodes, map over them so that
      // the correct metadata is applied to everything
      params: params.map(mapChildren),
    };
  }

  return {
    ...node,
    params: node.params.map(mapChildren),
  };
});
