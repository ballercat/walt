import test from "ava";
import compile from "..";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src, { encodeNames: true }), imports);

test("empty module compilation", t =>
  compileAndRun("").then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  }));

test("invalid imports throw", t =>
  t.throws(() => compile("import foo from 'bar'")));

test("compiler basics", t =>
  compileAndRun(
    `import { two: TwoType, alsoTwo: TwoType, externalConst: i32 } from 'env';
  type TwoType = () => i32;
   // Memory
   const memory: Memory<{ initial: 1 }>;
   // Const globals, export
   export const bar: i32 = 2;
   let foo: i32 = 3;
   let baz: i32 = 0;
   let x: i32;

   // Function export
   export function test(): i32 {
     x = 1;
     // Local vs global, test scope
     const foo: i32 = two();
     // set global
     baz = alsoTwo();

     // global references, math
     return 2 * 2 + foo + baz;
   }

   export function testLargeSignedConstant(): i32 {
     return 126;
   }
   function number(): i64 {
     const x: i64 = 42;
     return x;
   }
   function two() : i64 {
     return 2;
   }
   export function test64BitConstants(): i32 {
     return number(): i32;
   }

   const gArray: i32[] = 0;
   export function testGlobalArray(): i32 {
     gArray[0] = 2;
     gArray[1] = 2;
     return gArray[0] + gArray[1];
   }
   const foobar: f64 = 24;
   export function testGlobali64(): f64 {
     return foobar;
   }

   const globalf32: f32 = 33.0;
   export function testGlobalF32(): f32 {
     return globalf32;
   }

  export function testExternalImport(): i32 {
    return externalConst;
  }
`,
    { env: { two: () => 2, alsoTwo: () => 2, externalConst: 42 } }
  ).then(module => {
    t.is(module.instance.exports.bar, 2);
    t.is(module.instance.exports.test(), 8);
    t.is(module.instance.exports.testLargeSignedConstant(), 126);
    t.is(module.instance.exports.testGlobalArray(), 4);
    t.is(module.instance.exports.testGlobali64(), 24);
    t.is(module.instance.exports.testGlobalF32(), 33.0);
    t.is(module.instance.exports.testExternalImport(), 42);
  }));

// The most boring spec ever
test("comparison operators", t => {
  return compileAndRun(`
export const GT_UNSIGNED: i32 = 0;
export const GT_SIGNED: i32 = 1;
export const GTE_UNSIGNED: i32 = 2;
export const GTE_SIGNED: i32 = 3;
export const LT_UNSIGNED: i32 = 4;
export const LT_SIGNED: i32 = 5;
export const LTE_UNSIGNED: i32 = 6;
export const LTE_SIGNED: i32 = 7;

export function testi32(lhs: i32, mode: i32): i32 {
  if (GT_UNSIGNED == mode) {
    return lhs > 1;
  } else if (GT_SIGNED == mode) {
    return lhs > -1;
  } else if (GTE_UNSIGNED == mode) {
    return lhs >= 1;
  } else if (GTE_SIGNED == mode) {
    return lhs >= -1;
  } else if (LT_UNSIGNED == mode) {
    return lhs < 1;
  } else if (LT_SIGNED == mode) {
    return lhs < -1;
  } else if (LTE_UNSIGNED == mode) {
    return lhs <= 1;
  } else if (LTE_SIGNED == mode) {
    return lhs <= -1;
  }

  return -1;
}

export function testi64(lhsi32: i32, mode: i32): i32 {
  // We can't pass in a 64 bit integer so we just goin to have to cast it
  const lhs: i64 = lhsi32: i64;
  if (GT_UNSIGNED == mode) {
    return lhs > 1;
  } else if (GT_SIGNED == mode) {
    return lhs > -1;
  } else if (GTE_UNSIGNED == mode) {
    return lhs >= 1;
  } else if (GTE_SIGNED == mode) {
    return lhs >= -1;
  } else if (LT_UNSIGNED == mode) {
    return lhs < 1;
  } else if (LT_SIGNED == mode) {
    return lhs < -1;
  } else if (LTE_UNSIGNED == mode) {
    return lhs <= 1;
  } else if (LTE_SIGNED == mode) {
    return lhs <= -1;
  }

  return -1;
}

export function testf32(lhs: f32, mode: i32): i32 {
  if (GT_UNSIGNED == mode) {
    return lhs > 1;
  } else if (GT_SIGNED == mode) {
    return lhs > -1;
  } else if (GTE_UNSIGNED == mode) {
    return lhs >= 1;
  } else if (GTE_SIGNED == mode) {
    return lhs >= -1;
  } else if (LT_UNSIGNED == mode) {
    return lhs < 1;
  } else if (LT_SIGNED == mode) {
    return lhs < -1;
  } else if (LTE_UNSIGNED == mode) {
    return lhs <= 1;
  } else if (LTE_SIGNED == mode) {
    return lhs <= -1;
  }

  return -1;
}

export function testf64(lhs: f64, mode: i32): i32 {
  if (GT_UNSIGNED == mode) {
    return lhs > 1;
  } else if (GT_SIGNED == mode) {
    return lhs > -1;
  } else if (GTE_UNSIGNED == mode) {
    return lhs >= 1;
  } else if (GTE_SIGNED == mode) {
    return lhs >= -1;
  } else if (LT_UNSIGNED == mode) {
    return lhs < 1;
  } else if (LT_SIGNED == mode) {
    return lhs < -1;
  } else if (LTE_UNSIGNED == mode) {
    return lhs <= 1;
  } else if (LTE_SIGNED == mode) {
    return lhs <= -1;
  }

  return -1;
}
`).then(({ instance: { exports } }) => {
    t.is(exports.testi32(2, exports.GT_UNSIGNED), 1);
    t.is(exports.testi32(0, exports.GT_SIGNED), 1);
    t.is(exports.testi32(1, exports.GTE_UNSIGNED), 1);
    t.is(exports.testi32(-1, exports.GTE_SIGNED), 1);
    t.is(exports.testi32(0, exports.LT_UNSIGNED), 1);
    t.is(exports.testi32(-2, exports.LT_SIGNED), 1);
    t.is(exports.testi32(1, exports.LTE_UNSIGNED), 1);
    t.is(exports.testi32(-1, exports.LTE_SIGNED), 1);

    t.is(exports.testi64(2, exports.GT_UNSIGNED), 1);
    t.is(exports.testi64(0, exports.GT_SIGNED), 1);
    t.is(exports.testi64(1, exports.GTE_UNSIGNED), 1);
    t.is(exports.testi64(-1, exports.GTE_SIGNED), 1);
    t.is(exports.testi64(0, exports.LT_UNSIGNED), 1);
    t.is(exports.testi64(-2, exports.LT_SIGNED), 1);
    t.is(exports.testi64(1, exports.LTE_UNSIGNED), 1);
    t.is(exports.testi64(-1, exports.LTE_SIGNED), 1);

    t.is(exports.testf32(2, exports.GT_UNSIGNED), 1);
    t.is(exports.testf32(0, exports.GT_SIGNED), 1);
    t.is(exports.testf32(1, exports.GTE_UNSIGNED), 1);
    t.is(exports.testf32(-1, exports.GTE_SIGNED), 1);
    t.is(exports.testf32(0, exports.LT_UNSIGNED), 1);
    t.is(exports.testf32(-2, exports.LT_SIGNED), 1);
    t.is(exports.testf32(1, exports.LTE_UNSIGNED), 1);
    t.is(exports.testf32(-1, exports.LTE_SIGNED), 1);

    t.is(exports.testf64(2, exports.GT_UNSIGNED), 1);
    t.is(exports.testf64(0, exports.GT_SIGNED), 1);
    t.is(exports.testf64(1, exports.GTE_UNSIGNED), 1);
    t.is(exports.testf64(-1, exports.GTE_SIGNED), 1);
    t.is(exports.testf64(0, exports.LT_UNSIGNED), 1);
    t.is(exports.testf64(-2, exports.LT_SIGNED), 1);
    t.is(exports.testf64(1, exports.LTE_UNSIGNED), 1);
    t.is(exports.testf64(-1, exports.LTE_SIGNED), 1);
  });
});
