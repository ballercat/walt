const { isNaN, parseInt } = Number;
const token = require('./../token');
const Syntax = require('./../Syntax');

const isNumber = char => !isNaN(parseInt(char));
const isDot = char => char === '.';
const number = char => isNumber(char) ? number : null;
const numberOrDot = char => {
  if (isDot(char))
    return number;

  if (isNumber(char)) {
    return numberOrDot;
  }
  return null;
};

const root = char => {
  if (char === '-' || char === '+')
    return numberOrDot;

  if (isDot(char))
    return number;

  if (isNumber(char))
    return numberOrDot;

  return null;
};

// TODO: split constants into literals String vs Numbers with Types
module.exports = token(root, Syntax.Constant);

