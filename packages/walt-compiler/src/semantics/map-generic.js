// @flow
import curry from "curry";
import Syntax from "../Syntax";
import { closureType as setClosureType } from "./metadata";

export const mapGeneric = curry((options, node, _) => {
  const { types } = options;
  const [generic, T] = node.params;
  const realType = types[T.value];
  // No other generic is supported, YET
  if (generic.value !== "Lambda") {
    return node;
  }
  const [args, result] = realType.params;
  // Patch the node to be a real type which we can reference later
  const patch = {
    ...realType,
    range: generic.range,
    value: node.value,
    meta: [...realType.meta, setClosureType(true)],
    params: [
      {
        ...args,
        params: [
          {
            ...args,
            params: [],
            type: "i32",
            value: "i32",
            Type: Syntax.Type,
          },
          ...args.params,
        ],
      },
      result,
    ],
  };
  types[patch.value] = patch;
  return patch;
});
