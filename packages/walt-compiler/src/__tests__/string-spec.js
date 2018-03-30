import test from "ava";
import { harness } from "../utils/test-utils";
import { readFileSync } from "fs";
import { join } from "path";

const source = readFileSync(join(__dirname, "./string-spec.walt"), "utf8");

test("string", harness(source));
