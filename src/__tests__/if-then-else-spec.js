import test from "ava";
import compile from "..";

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("inline if statement", t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    if (x < 2) x = 2;
    return x;
  }`).then(outputIs(t, 2)));

test("inline if else", t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    if (x > 2)
      x = 0;
    else
      x = 42;
   return x;
 }`).then(outputIs(t, 42)));

test("block if statement", t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 0;
    if (x < 2) {
      y = 2;
      x = y * 2;
    }
    return x;
  }`).then(outputIs(t, 4)));

test("block if else statement", t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 0;
    if (x > 0) {
      y = 3;
    } else {
      y = 2;
    }
    x = y * 2;
    return x;
  }`).then(outputIs(t, 4)));

test("ternary", t =>
  compileAndRun(`
  export function test(): i32 {
    return 1 ? 42 : 24;
  }`).then(outputIs(t, 42)));

test("else if statement", t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 1;
    let y: i32 = 0;
    if (x == 0) {
      y = 2;
    } else if (x == 1) {
      y = 4;
    } else {
      y = 1;
    }
    return y;
  }`).then(outputIs(t, 4)));

  test("else if statement no {}", t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 1;
    let y: i32 = 0;
    if (x == 0)
      y = 2;
    else if (x == 1)
      y = 4;
    else
      y = 1;
    return y;
  }`).then(outputIs(t, 4)));
