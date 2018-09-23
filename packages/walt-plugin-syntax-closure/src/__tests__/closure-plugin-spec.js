import test from 'ava';
import { compile } from 'walt-compiler';
import { plugin, imports } from '..';

test('closures', t => {
  const source = `
const table: Table<{ element: 'anyfunc', initial: 5 }>;
type Func = (i32, i32) => i32;
type Simple = () => i32;
type Void = () => void;
type ArgsOnly = (i32, i32) => void;

type Closure = Lambda<Func>;
type SimpleClosure = Lambda<Simple>;
type VoidClosure = Lambda<Void>;
type ArgsOnlyClosure = Lambda<ArgsOnly>;

function getSimpleLambda(): SimpleClosure {
  let x: i32 = 0;
  const z: i64 = (1 : i64);
  return (): i32 => {
    // assignment here, we need to cover regular assignment in closures
    let y: i32 = 0;
    y = z: i32;
    x += y;
    return x;
  };
}

function getLambda(): Closure {
  // close over two locals
  let x: i32 = 0;
  return (xx: i32, yy: i32): i32 => {
    x += yy;
    return x + xx;
  };
}

// Closures below are not useful, but necessary to cover all scenarios
function getVoidLamba(): VoidClosure {
  let x: i32 = 0;
  return () => {
    x += 1;
  };
}

function getArgsOnlyLambda(): ArgsOnlyClosure {
  let x: i32 = 0;
  return (z: i32, y: i32) => {
    x+= z + y;
  };
}

export function test(): i32 {
  const closure: Closure = getLambda();
  // // should be 5
  const x: i32 = closure(2, 3);

  const closure2: SimpleClosure = getSimpleLambda();
  // should be 1
  closure2();
  // should be 2
  const y: i32 = closure2();
  // should be 7
  return x + y;
}
`;

  const options = { version: 1, extensions: [plugin] };
  return Promise.resolve(imports(options, compile))
    .then(closureImports =>
      WebAssembly.instantiate(compile(source, options).buffer(), closureImports)
    )
    .then(result => {
      const fn = result.instance.exports.test;
      t.is(fn(), 7);
    });
});
