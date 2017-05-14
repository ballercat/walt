const supported = [
  '+',
  '++',
  '-',
  '--',
  '=',
  '==',
  '%',
  '/',
  '^',
  '&',
  '|',
  '!'
];

module.exports = {
  supported,
  is: (value) => supported.includes(value),
  type: 'operator'
};

