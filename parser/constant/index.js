const { isNaN, parseInt } = Number;

const is = value => {
  if (value == null)
    return false;

  const pieces = value.split('.');
  if (pieces.length === 2) {
    const integer = pieces[0] === '' ? '0' : pieces[0];
    const factorial = pieces[1];

    if (
      !isNaN(parseInt(integer)) &&
      !isNaN(parseInt(factorial))
    ) {
      return true;
    }
  } else if (pieces.length === 1) {
    return !isNaN(parseInt(value));
  }

  return false;
};

module.exports = { is, type: 'constant' };

