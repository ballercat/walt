// @flow
import Syntax from "../../Syntax";
import curry from "curry";
import { balanceTypesInMathExpression } from "./patch-typecasts";
import { get, TYPE_OBJECT } from "../metadata";
import walkNode from "../../utils/walk-node";

export default curry(function mapAssignment(options, node, mapChildren) {
  const [lhs, rhs] = node.params;

  // id = { <param>: <value> };
  if (rhs && rhs.Type === Syntax.ObjectLiteral) {
    const individualKeys = {};
    const spreadKeys = {};
    // We have to walk the nodes twice, once for regular prop keys and then again
    // for ...(spread)
    walkNode({
      // Top level Identifiers _inside_ an object literal === shorthand
      // Notice that we ignore chld mappers in both Pairs and Spread(s) so the
      // only way this is hit is if the identifier is TOP LEVEL
      [Syntax.Identifier]: (identifier, _) => {
        individualKeys[identifier.value] = {
          ...lhs,
          Type: Syntax.MemoryAssignment,
          params: [
            { ...lhs, Type: Syntax.ArraySubscript, params: [lhs, identifier] },
            identifier,
          ],
        };
      },
      [Syntax.Pair]: (pair, _) => {
        const [property, value] = pair.params;
        individualKeys[property.value] = {
          ...lhs,
          Type: Syntax.MemoryAssignment,
          params: [
            { ...lhs, Type: Syntax.ArraySubscript, params: [lhs, property] },
            value,
          ],
        };
      },
      [Syntax.Spread]: (spread, _) => {
        // find userType
        const { locals, userTypes } = options;
        const [target] = spread.params;
        const userType = userTypes[locals[target.value].type];
        const keyOffsetMap = get(TYPE_OBJECT, userType);
        if (keyOffsetMap != null) {
          // map over the keys
          Object.keys(keyOffsetMap.payload).forEach(key => {
            const offsetNode = {
              ...target,
              Type: Syntax.Identifier,
              value: key,
              params: [],
            };
            // profit
            spreadKeys[key] = {
              ...lhs,
              Type: Syntax.MemoryAssignment,
              params: [
                {
                  ...lhs,
                  Type: Syntax.ArraySubscript,
                  params: [lhs, { ...offsetNode }],
                },
                {
                  ...target,
                  Type: Syntax.ArraySubscript,
                  params: [
                    target,
                    {
                      ...offsetNode,
                    },
                  ],
                },
              ],
            };
          });
        }
      },
    })(rhs);

    const params = Object.values({ ...spreadKeys, ...individualKeys });
    return {
      ...lhs,
      Type: Syntax.Block,
      // We just created a bunch of MemoryAssignment nodes, map over them so that
      // the correct metadata is applied to everything
      params: params.map(mapChildren),
    };
  }

  // FIXME
  // @ballercat:
  // These extra typecasts are added because 64 bit Constant values are not
  // encoded correctly, apparently they need to literrally be 64 bits wided in the
  // binary, which is different form variable length 32 bit Ints/floats. The type-cast
  // is easier to encode and perform at this point. Please fix the encoding.
  return balanceTypesInMathExpression({
    ...node,
    params: node.params.map(mapChildren),
  });
});
