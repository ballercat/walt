// @flow
import mapSyntax from "./map-syntax";
import mergeBlock from "./merge-block";
import { getTypecastOpcode } from "../emitter/opcode";
import { get, TYPE_CAST } from "../parser/metadata";
import invariant from "invariant";
import type { GeneratorType } from "./flow/types";
import type { Node } from "../flow/types";

const generateTypecast: GeneratorType = (node, parent) => {
  const metaTypecast = get(TYPE_CAST, node);
  invariant(
    metaTypecast,
    `Cannot generate typecast for node: ${JSON.stringify(node)}`
  );

  const { to, from } = metaTypecast.payload;

  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  return [
    ...block,
    {
      kind: getTypecastOpcode(to, from),
      params: [],
    },
  ];
};

export default generateTypecast;
