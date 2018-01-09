// @flow
import Syntax from "../Syntax";
import curry from "curry";
import { balanceTypesInMathExpression } from "./patch-typecasts";
import { get, TYPE_OBJECT } from "./metadata";
import walkNode from "../utils/walk-node";

export default curry(function mapAssignment(options, node, mapChildren) {
  return node;
});
