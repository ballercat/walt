import TokenStream from '../utils/token-stream';
import Syntax from '../Syntax';
import Context from './context';

class BaseParser {
  constructor(stream, context = new Context({
    body: [],
    diAssoc: 'right',
    stream: stream,
    token: stream.next(),
    globalSymbols: {},
    localSymbols: {},
    globals: [],
    functions: []
  })) {
    this.context = context;
  }
}

export default BaseParser;

