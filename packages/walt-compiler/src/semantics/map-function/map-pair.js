// @flow
import curry from "curry";
import Syntax from "../../Syntax";
import { typeCast } from "../metadata";
import { collapseClosureIdentifier, CLOSURE_BASE } from "../closure";
import type { NodeType } from "../../flow/types";

export default curry(
  (options, typeCastMaybe: NodeType, transform): NodeType => {
    // Pairs can be closures of form (<args>): <return_type> => { <block> }
    const [closureMaybe] = typeCastMaybe.params;
    const { locals, mapClosure, topLevelTransform, mapIdentifier } = options;

    if (closureMaybe.Type === Syntax.Closure) {
      const [decl] = mapClosure(closureMaybe, topLevelTransform).params;
      options.hoist.push(decl);

      return transform(
        collapseClosureIdentifier(
          { ...locals[CLOSURE_BASE], meta: [] },
          mapIdentifier({
            ...decl,
            params: [],
            type: "i32",
            Type: Syntax.Identifier,
            meta: [],
          })
        )
      );
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
