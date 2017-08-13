import _Tokenizer from './Tokenizer';
import _TokenStream from './TokenStream';
import _Stream from './Stream';
import _keyword from './keyword';
import _punctuator from './punctuator';
import _identifier from './identifier';
import _type from './type';
import _constant from './constant';
import Parser from './Parser';

export const tokenParsers = [
  _keyword, _constant, _punctuator, _type, _identifier
];

export const Tokenizer = _Tokenizer;
export const Stream = _Stream;
export const type = _type;
export const keyword = _keyword;
export const constant = _constant;
export const punctuator = _punctuator;
export const identifier = _identifier;
export const TokenStream = _TokenStream;

export default Parser;

