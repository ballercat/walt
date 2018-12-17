export default function pick(list, obj) {
  let result = {};
  let i = 0;
  for (i; i < list.length; i++) {
    result[list[i]] = obj[list[i]];
  }
  return result;
}
