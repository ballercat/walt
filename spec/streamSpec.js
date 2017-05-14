const Stream = require('../parser/Stream');
const snapshot = require('snap-shot');
const { sources } = require('./specUtils');

describe('Stream', () => {
  let output;
  beforeEach(() => {
    output = [];
    const stream = new Stream(sources.basic);
    while (!Stream.eof(stream.peek()))
      output.push(stream.next());
  });

  it('can read an input stream', () => {
    snapshot(output);
  });
});

