const parser = require('./parser');
const fs = require('fs');

fs.readdir('./walt', (err, files) => {
  console.log(files);
});

