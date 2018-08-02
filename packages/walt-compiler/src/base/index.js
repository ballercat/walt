// Base plugin
export default function base() {
  return {
    semantics() {
      return {
        "*": _ =>
          function baseSemanticsParser({ node }, t) {
            return { ...node, params: node.params.map(t) };
          },
      };
    },
  };
}
