import token from "../token";
import Syntax from "../../Syntax";

const everything = () => everything;

const slash = char => {
  if (char === "/") return everything;
};

const maybeComment = char => {
  if (char === "/") return slash;

  return null;
};

const commentParser = token(maybeComment, Syntax.Comment);
export default commentParser;
