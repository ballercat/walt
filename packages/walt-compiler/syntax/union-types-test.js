import { assert : Assert, memory : Memory } from 'env';
type Assert = (i32, i32, i32) => void;

let OFFSET : i32;

/**
 * Assert that structs may be joined with sugary array types to allow for
 * indexing into a struct
 *
 *
 */

// String type is a union of String and i32[]
type String = { byteLength: i32, &data: i32[] };
type IndexedString = String | i32[];

function array_struct_unions() {

  const string : IndexedString = OFFSET;
  string.byteLength = 4;

  // Test union types. Assign the value of "fooz" to the first index in the
  // i32[] array type version of string
  string[1] = 'f' | ('o' << 8) | ('o' << 16) | ('z' << 24);

  // Direct addressing test. Read back values written via direct addressing
  // and built-in native functions
  assert("char offset of string - f", i32.load8_u(string.data), 'f');
  assert("char offset of string - o", i32.load8_u(string.data + 1), 'o');
  assert("char offset of string - o", i32.load8_u(string.data + 2), 'o');
  assert("char offset of string - z", i32.load8_u(string.data + 3), 'z');

  assert("address sanity check - f", i32.load8_u(1024 + 4), 'f');
  assert("address sanity check - o", i32.load8_u(1024 + 4 + 1), 'o');
  assert("address sanity check - o", i32.load8_u(1024 + 4 + 2), 'o');
  assert("address sanity check - z", i32.load8_u(1024 + 4 + 3), 'z');
}

export function run() {
  // array_native_unions();
  array_struct_unions();
}

function start() {
  OFFSET = 1024;
}
