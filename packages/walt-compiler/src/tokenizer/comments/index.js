// @flow
import token from "../token";
import Syntax from "../../Syntax";

import {
  SLASH,
  SINGLE_LINE,
  MULTI_LINE_START,
  MULTI_LINE_END,
  COMMENT_IDENTIFIERS,
  everything,
} from "./constants";

let isMultiline = false;
let previous = null;

const isComment = current => {
  let value = null;
  switch (`${previous}${current}`) {
    case MULTI_LINE_END: {
      isMultiline = false;
      value = isComment;
      break;
    }
    case MULTI_LINE_START: {
      isMultiline = true;
      break;
    }
    case SINGLE_LINE: {
      value = everything;
      break;
    }
  }

  if (isMultiline) {
    value = isComment;
    previous = current;
  }

  return value;
};

const maybeComment = current => {
  let buffer = previous;
  previous = current;
  if (
    current === SLASH ||
    COMMENT_IDENTIFIERS.indexOf(`${buffer}${current}`) > -1 ||
    isMultiline
  ) {
    return isComment;
  }

  return null;
};

const commentParser = token(maybeComment, Syntax.Comment);
export default commentParser;
