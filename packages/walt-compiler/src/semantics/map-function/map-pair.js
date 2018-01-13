// @flow
import curry from "curry";
import Syntax from "../../Syntax";
import { typeCast, funcIndex as setMetaFunctionIndex } from "../metadata";
import type { NodeType } from "../../flow/types";

export default curry(
  (options, typeCastMaybe: NodeType, transform): NodeType => {
    // Pairs can be closures of form (<args>): <return_type> => { <block> }
    const [closureMaybe] = typeCastMaybe.params;
    const { functions, mapClosure, topLevelTransform, mapIdentifier } = options;

    if (closureMaybe.Type === Syntax.Closure) {
      if (functions.i32closureGet__ == null) {
        const baseIndex = Object.keys(functions).length;
        functions.i32closureGet__ = {
          type: "i32",
          value: "i32closureGet",
          params: [],
          range: [],
          meta: [setMetaFunctionIndex(baseIndex + 1)],
          Type: Syntax.FunctionDeclaration,
        };
        functions.i32closureSet__ = {
          type: null,
          value: "i32closureSet",
          params: [],
          range: [],
          meta: [setMetaFunctionIndex(baseIndex + 2)],
          Type: Syntax.FunctionDeclaration,
        };
      }

      const [decl] = mapClosure(closureMaybe, topLevelTransform).params;
      options.hoist.push(decl);
      return mapIdentifier({
        ...decl,
        params: [],
        type: "i32",
        Type: Syntax.Identifier,
        meta: [],
      });
    }

    const [targetNode, typeNode] = typeCastMaybe.params.map(transform);

    const { type: from } = targetNode;
    const { value: to } = typeNode;

    // If both sides of a pair don't have types then it's not a typecast,
    // more likely a string: value pair in an object for example
    if (typeNode.Type === Syntax.Type && !!from && !!to) {
      return {
        ...typeCastMaybe,
        type: to,
        value: targetNode.value,
        Type: Syntax.TypeCast,
        meta: [...typeCastMaybe.meta, typeCast({ to, from })],
        // We need to drop the typeNode here, because it's not something we can generate
        params: [targetNode],
      };
    }

    return {
      ...typeCastMaybe,
      params: typeCastMaybe.params.map(transform),
    };
  }
);
