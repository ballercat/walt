const link = require("walt-link");
const fs = require("fs");
const path = require("path");

module.exports = function wrap(filepath) {
  const builder = link(filepath);
  return `
    module.exports = function(importObj) {
      return Promise.resolve();
    };
  `;
};
