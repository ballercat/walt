/**
 * Compare selects with if/thens
 *
 */

function getX() : i32 {
  return -100;
}
function getY() : i32 {
  return 100;
}

export function select_simple(c: i32) {
  let r: i32;
  while(c -= 1) {
    r = c % 2 ? getX() : getY();
  }
}

export function ifthen_simple(c: i32) {
  let r : i32;
  while(c -= 1) {
    if (c % 2) {
      r = getX();
    } else {
      r = getY();
    }
  }
}

export function select_nested(c: i32) {
}

export function ifthen_simple(c: i32) {
}
