/**
 * The bootstrap logic for testing all of the syntax features
 * of the compiler.
 */
import test from 'ava';
import fs from 'fs';
import path from 'path';
import { harness } from '../utils/test-utils';

// Whitelist for "focusing" on specific specs, disabling specs etc.
const whitelist = ['struct', 'type', 'union-types'];

test('Syntax test suite', t => {
  let resolve;
  let reject;
  let p = new Promise((r, rj) => {
    resolve = r;
    reject = rj;
  });

  const postfix = '-test.walt';
  const isWhitelisted = f => whitelist.includes(f.slice(0, -postfix.length));

  fs.readdir(path.resolve(__dirname, '../../syntax'), (err, files) => {
    if (err != null) {
      reject(err);
    }

    let testCases = files.filter(isWhitelisted);
    const runTest = file => {
      const T = {
        is: (e, r, text) => t.is(e, r, file + ' - ' + text),
      };
      try {
        return harness(path.resolve(__dirname, '../../syntax', file))(T).catch(
          e => {
            // eslint-disable-next-line
            console.error(
              `  Runtime failure for syntax test at ${file}\n\n  ${e.message}`
            );
            throw e;
          }
        );
      } catch (e) {
        // eslint-disable-next-line
        console.error(
          `  Failed syntax test compilation at ${file} ${e.message}`
        );
        return Promise.reject(new Error(`Failed at ${file}`));
      }
    };

    Promise.all(testCases.map(runTest)).then(resolve);
  });

  return p;
});
