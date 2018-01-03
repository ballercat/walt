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

let isMultiline: boolean = false;
let previous: string;

const isComment = (current: string) => {
  switch (`${previous}${current}`) {
    case MULTI_LINE_END: {
      isMultiline = false;
      return isComment;
    }
    case MULTI_LINE_START: {
      isMultiline = true;
      return isComment;
    }
    case SINGLE_LINE: {
      return everything;
    }
    default: {
      if (isMultiline) {
        previous = current;
        return isComment;
      }
    }
  }
};

const maybeComment = (current: string) => {
  const buffer: string = previous;
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
