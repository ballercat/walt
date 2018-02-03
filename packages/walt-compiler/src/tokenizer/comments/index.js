// @flow
import token from "../token";
import Syntax from "../../Syntax";
import Stream from "../../utils/stream";

import {
  SLASH,
  SINGLE_LINE,
  MULTI_LINE_START,
  MULTI_LINE_END,
  COMMENT_IDENTIFIERS,
} from "./constants";

const parser = char => {
  let isMultiline: boolean = false;
  let isSingleLine: boolean = false;
  let previous: string;

  const isComment = (current: string) => {
    if (Stream.eol(current)) {
      isSingleLine = false;
    }

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
        isSingleLine = true;
        return isComment;
      }
      default: {
        if (isMultiline || isSingleLine) {
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
      isMultiline ||
      COMMENT_IDENTIFIERS.indexOf(`${buffer}${current}`) > -1
    ) {
      return isComment;
    }

    return null;
  };

  return maybeComment(char);
};

export default token(parser, Syntax.Comment);
