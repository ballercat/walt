const Stream = require('../parser/Stream');
const snapshot = require('snap-shot');
const { readFileSync } = require('fs');
const { resolve } = require('path');
const walt = {
  basic: readFileSync(resolve('walt/basic.walt'), 'utf8')
};

describe('Stream', () => {
  let output;
  beforeEach(() => {
    output = [];
    const stream = new Stream(walt.basic);
    while (!Stream.eof(stream.peek()))
      output.push(stream.next());
  });

  it('can read an input stream', () => {
    snapshot(output);
  });
});

