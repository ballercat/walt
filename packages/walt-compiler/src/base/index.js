// Base plugin
export default function base() {
  return {
    semantics() {
      return {
        "*": _ => (node, t) => ({ ...node, params: node.params.map(t) }),
      };
    },
  };
}
