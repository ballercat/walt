
function makeArray(args) {
  return Array.prototype.slice.apply(args);
}

/**
 * Curry a function
 *
 * @param  {function} fn The function you wish to curry
 * @return {function}
 */
module.exports = curry;
function curry(fn) {
  function curried() {
    if (arguments.length < fn.length) {
      var args = makeArray(arguments);
      return function () {
        return curried.apply(this, args.concat(makeArray(arguments)));
      }
    } else {
      return fn.apply(this, arguments);
    }
  };
  return curried;
}

