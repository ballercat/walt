const { isNaN, parseInt } = Number;
const operator = require('./../operator');
const token = require('./../token');

const isNumber = char => !isNaN(parseInt(char));
const isDot = char => char === '.';
const number = char => isNumber(char) ? isNumber : null;
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

module.exports = token(root, 'constant');

