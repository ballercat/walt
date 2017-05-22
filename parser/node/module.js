const { where, equals } = require('ramda');
const keyword = require('./../keyword');

const moduleStart = where({
  type: equals(keyword.type),
  value: equals(keyword.supported.module)
});


