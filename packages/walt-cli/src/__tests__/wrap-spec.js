import test from "ava";
import path from "path";
import wrap from "../wrap";

test("cli wrap command", t => {
  const autoBuild = wrap(path.resolve(__dirname, "../../demo/index.walt"));
  t.is(typeof autoBuild === "string", true, "wrap returns a string");
});
