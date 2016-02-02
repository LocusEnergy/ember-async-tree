import Ember from 'ember';
import { module, test} from 'qunit';
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
  assert.expect(3);
  visit('/infinite-scroll');
  assert.equal(find('.node-list-item').length, 0, 'has 0 elements at beginning');

  andThen(() => {
    assert.equal(find('.node-list-item').length, 50, 'has 50 elements');
    let scrollEl = find('.infinite-scroll-container .async-tree .node-list');

    // Because ember test suite shrinks viewport, relocate the scroll element
    // to assure triggering async-more
    scrollEl.css('position', 'fixed');
    scrollEl.css('top', 0);
    scrollEl.css('left', 0);
    let scroll = scrollEl[0];
    scroll.scrollTop = scroll.scrollHeight;
  });

  andThen(() => {
    assert.equal(find('.node-list-item').length, 100, 'has 100 elements');
  });

});
