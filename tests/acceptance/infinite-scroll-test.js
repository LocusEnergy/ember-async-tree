import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'dummy/tests/helpers/start-app';

module('Acceptance: Infinite Scroll', {
  beforeEach: function() {
    this.application = startApp();
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
  }
});

test('tree rendering', function(assert) {
  visit('/infinite-scroll');
  
});
