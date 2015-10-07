import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'dummy/tests/helpers/start-app';

module('Acceptance: Paginated', {
  beforeEach: function() {
    this.application = startApp();
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
  }
});

test('tree rendering', function(assert) {
  visit('/paginated');

  andThen(function() {
    assert.equal(currentURL(), '/paginated', 'on paginated route');
    assert.ok($('.async-tree').length === 1, 'async-tree component is rendered');
    assert.equal($('.async-tree ul li').length, 10, '10 items are rendered');
    assert.equal($('.async-tree ul li:contains("(from model)")').length, 10, '10 items from model are rendered');
    assert.equal($('.async-tree .load-more').length, 1, 'load more link is visible');
  });
  click('span:contains(More)');
  andThen(function(){
    assert.equal($('.async-tree ul li:contains("(from model)")').length, 10, '10 items from model are rendered');
    assert.equal($('.async-tree ul li:contains("from: controller)")').length, 10, '10 items from controller are rendered');
  });
  click('.node-toggle-open:contains("Item 0 (from model)")');
  andThen(function(){
    assert.ok($('.async-tree ul li:contains("Item 0 (from model)")').hasClass('is-open'), 'Item 0 (from model) is open');
    assert.equal($('.async-tree ul li > ul li:contains("(page: 1, from: controller)")').length, 10, "10 items shown after first item");
    assert.equal($('.async-tree ul li > .load-more').length, 1, 'expanded list has more link');
  });
  click('ul li > span:contains(More)');
  andThen(function(){
    assert.equal($('.async-tree ul li > ul li:contains("(page: 2, from: controller)")').length, 10, "10 items shown from more");
  });
});
