// @flow
export const SLASH = "/";
export const ASTERIX = "*";

export const SINGLE_LINE = `${SLASH}${SLASH}`;
export const MULTI_LINE_START = `${SLASH}${ASTERIX}`;
export const MULTI_LINE_END = `${ASTERIX}${SLASH}`;

export const COMMENT_IDENTIFIERS = [
  SINGLE_LINE,
  MULTI_LINE_START,
  MULTI_LINE_END,
];

export const everything = () => everything;
