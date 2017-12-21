import {
  getTypeString,
  I32,
  I64,
  F32,
  F64,
  FUNC,
  ANYFUNC
} from "../value_type";

test("getTypeString returns string version of the constant", () => {
  expect(getTypeString(I32)).toMatchSnapshot();
  expect(getTypeString(F32)).toMatchSnapshot();
  expect(getTypeString(I64)).toMatchSnapshot();
  expect(getTypeString(F64)).toMatchSnapshot();
  expect(getTypeString(FUNC)).toMatchSnapshot();
  expect(getTypeString(ANYFUNC)).toMatchSnapshot();
});
