// @flow
import Syntax from "../Syntax";
import type { NodeType } from "../flow/types";

export default function mapCharacterLiteral(node: NodeType): NodeType {
  const codePoint = node.value.codePointAt(0);
  return {
    ...node,
    Type: Syntax.Constant,
    type: "i32",
    value: String(codePoint),
  };
}
