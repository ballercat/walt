import test from "ava";
import compiler from "..";

test("compiler", t => {
  return compiler(`export const x: i32 = 42;`).then(result => {
    console.log(result);
  });
});
