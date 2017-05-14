const supported = [
  'i32',
  'i64',
  'f32',
  'f64',
  'anyfunc'
];

module.exports = {
  supported,
  is: (value) => supported.includes(value),
  type: 'type'
};

