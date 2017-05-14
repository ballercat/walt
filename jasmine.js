var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfigFile('jasmine.json');

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

jasmine.clearReporters();               // remove default reporter logs
jasmine.addReporter(new SpecReporter({  // add jasmine-spec-reporter
  spec: {
    displayPending: true
  }
}));

jasmine.execute();
