import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";

export default function generateMemory(node) {
  const table = { max: 0, initial: 0 };

  walkNode({
    [Syntax.Pair]: ({ params }) => {
      // This could procude garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      if (key === "initial") {
        table.initial = parseInt(value);
      } else if (key === "element") {
        table.type = value;
      }
    }
  })(node);

  return table;
}
