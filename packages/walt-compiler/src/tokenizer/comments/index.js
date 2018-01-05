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

const parser = () => {
  let isMultiline: boolean = false;
  let previous: string;

  const isComment = (char: string) => {
    switch (`${previous}${char}`) {
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
          previous = char;
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
      isMultiline ||
      COMMENT_IDENTIFIERS.indexOf(`${buffer}${current}`) > -1
    ) {
      return isComment;
    }

    return null;
  };

  return token(maybeComment, Syntax.Comment);
};

const commentParser = parser();
export default commentParser;
