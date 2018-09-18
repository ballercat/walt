import test from 'ava';
import { getIR, debug } from '..';

test('objects', t => {
  const walt = `
  const memory: Memory = { initial: 1 };
  type TestType = { x: i32, y: i32, z: i32 };
  type MixedType = { x: i32, y: f32, z: i64, w: f64 };

  // Obviously not a real malloc
  let MEMORY_OFFSET: i32 = 0;
  function malloc(size_t: i32) : i32 {
    const addr: i32 = MEMORY_OFFSET;
    MEMORY_OFFSET += size_t;
    return addr;
  }

  export function testSubscript() : i32 {
    const obj: TestType = malloc(sizeof(TestType));
    obj.x = 2;
    obj.y = 2;
    return obj.x + obj.y;
  }

  export function testAlignment(): i32 {
    const obj: TestType = malloc(sizeof(TestType));
    const lens: i32[] = obj;

    obj = { x: 1, y: 1, z: 1 };
    lens[0] = 2;
    lens[1] = 2;
    lens[2] = 2;

    return obj.x + obj.y + obj.z;
  }
  export function testMixedTypeProperties(): f32 {
    const obj: MixedType = malloc(sizeof(MixedType));

    obj = { z: (4: i64), w: (4: f64) };
    return (obj.z + obj.w) : f32;
  }
  export function testObjectSyntaxSugar(z: i32, x: i32): i32 {
    const obj: TestType = malloc(sizeof(TestType));
    const obj2: TestType = malloc(sizeof(TestType));

    // same key and value identifier works
    obj2 = { y: 2 };
    // shorthand works!
    obj2 = { x };
    // spread works
    obj = { ...obj2, z };

    return obj.x + obj.y + obj.z;
  }
`;

  const wasm = getIR(walt);
  t.snapshot(debug(wasm));
  return WebAssembly.instantiate(wasm.buffer()).then(result => {
    const exports = result.instance.exports;

    t.is(exports.testSubscript(), 4, 'Regular old string subscripts');
    t.is(exports.testAlignment(), 6, 'Alignment of objects, array lenses/ptrs');
    t.is(exports.testMixedTypeProperties(), 8, 'Mixed bit-width object props');
    t.is(exports.testObjectSyntaxSugar(2, 2), 6, 'Object syntax sugar');
  });
});
