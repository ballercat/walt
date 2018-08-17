// Base plugin
export default function base() {
  return {
    semantics() {
      return {
        '*': _ =>
          function baseSemanticsParser([node, ...rest], t) {
            const result = {
              ...node,
              params: node.params.map(child => t([child, ...rest])),
            };

            return result;
          },
      };
    },
  };
}
