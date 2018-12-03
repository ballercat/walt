export default function(transform, context) {
  const args = [null, context];
  return function(node) {
    args[0] = node;
    return transform(args);
  };
}
