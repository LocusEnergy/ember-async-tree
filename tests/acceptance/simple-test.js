import { module, test } from 'qunit';
import startApp from 'dummy/tests/helpers/start-app';
import destroyApp from 'dummy/tests/helpers/destroy-app';

module('simple', {
  beforeEach: function() {
    this.application = startApp();
  },

  afterEach: function() {
    destroyApp(this.application);
  }
});

test('visiting /simple', function(assert) {
  visit('/simple');
  andThen(function() {
    assert.equal(currentURL(), '/simple');
    assert.ok($('.async-tree:visible').length > 0, 'async-tree was rendered');
    assert.equal($('.node-label').length, 2, 'showing 2 nodes');
    assert.equal($('.node-label:eq(0)').text().trim(), 'George Costanza', 'showing George Costanza');
    assert.equal($('.node-label:eq(1)').text().trim(), 'Cosmo Kramer', 'showing Cosmo Kramer');
  });
  click('.node-label:contains("George")');
  andThen(function(){
    assert.ok($('.async-tree-node.is-open .node-label:contains("George")').length > 0, 'George node is open');
    assert.equal($('.node-label').length, 4, 'showing 4 nodes');
    assert.equal($('.async-tree-node.is-open .node-label:eq(1)').text().trim(), "Jerry's house", 'showing Jerrys house');
    assert.equal($('.async-tree-node.is-open .node-label:eq(2)').text().trim(), 'Dinner', 'showing Dinner');
  });
  click('.node-label:contains("Jerry\'s house")');
  andThen(function(){
    assert.ok($('.async-tree-node.is-open .node-label:contains("Jerry\'s house")').length > 0, 'Jerry\'s house node is open');
    assert.equal($('.node-label').length, 6, 'showing 4 nodes');
    assert.equal($('.async-tree-node.is-open .node-label:eq(2)').text().trim(), "Fork", 'showing Fork');
    assert.equal($('.async-tree-node.is-open .node-label:eq(3)').text().trim(), "Shoe", 'showing Shoe');
  });
});
