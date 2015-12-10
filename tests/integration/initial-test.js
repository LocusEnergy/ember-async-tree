import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import {
  FIRST_PARENT,
  SECOND_PARENT,
  THIRD_PARENT,
  FIRST_CHILD,
  SECOND_CHILD,
  FIRST_GRANDCHILD,
  SECOND_GRANDCHILD,
  FILTER
} from '../helpers/constants';

import AsyncTreePageObject from 'ember-async-tree/tests/page-object';

moduleForComponent('async-tree', 'integration: initial values', {
  integration: true,
  beforeEach() {
    this.asyncTree = new AsyncTreePageObject(this, true);
  }
});

test('initial values are rendered', function(assert) {
  let initial = [ FIRST_PARENT, SECOND_PARENT, THIRD_PARENT ];

  this.set('initial', initial);

  this.render(hbs`
    {{#async-tree
      initial=initial
      as |node|}}{{node.name}}
    {{/async-tree}}`);

  assert.equal(this.asyncTree.itemText(0), 'first parent');
  assert.equal(this.asyncTree.itemText(1), 'second parent');
  assert.equal(this.asyncTree.itemText(2), 'third parent');
});

test('initial values open nodes', function(assert){
  let initial = [ FIRST_PARENT, FIRST_CHILD, FIRST_GRANDCHILD ];

  this.set('initial', initial);

  this.set('initialFilter', FILTER);

  this.render(hbs`
    {{#async-tree
      initial=initial
      initial-filter=initialFilter
      as |node|}}{{node.name}}
    {{/async-tree}}`);

  assert.equal(this.asyncTree.itemText(0), 'first parent');
  assert.equal(this.asyncTree.itemText(1), 'first child');
  assert.equal(this.asyncTree.itemText(2), 'first grandchild');

  assert.ok(this.asyncTree.itemContains('first parent').hasClass('is-open'));
  assert.ok(this.asyncTree.itemContains('first child').hasClass('is-open'));
  assert.ok(this.asyncTree.itemContains('first grandchild').hasClass('is-not-open'));
});

test('changing initial value rebuilds the tree', function(assert){

  this.set('initialFilter', FILTER);

  this.set('initial', [ FIRST_PARENT, FIRST_CHILD, FIRST_GRANDCHILD ]);

  this.render(hbs`
    {{#async-tree
      initial=initial
      initial-filter=initialFilter
      as |node|}}{{node.name}}
    {{/async-tree}}`);

  assert.equal(this.asyncTree.itemText(0), 'first parent');
  assert.equal(this.asyncTree.itemText(1), 'first child');
  assert.equal(this.asyncTree.itemText(2), 'first grandchild');

  this.set('initial', [ SECOND_PARENT, SECOND_CHILD, SECOND_GRANDCHILD ]);

  assert.equal(this.asyncTree.itemText(0), 'second parent');
  assert.equal(this.asyncTree.itemText(1), 'second child');
  assert.equal(this.asyncTree.itemText(2), 'second grandchild');

  assert.ok(this.asyncTree.itemContains('second parent').hasClass('is-open'));
  assert.ok(this.asyncTree.itemContains('second child').hasClass('is-open'));
  assert.ok(this.asyncTree.itemContains('second grandchild').hasClass('is-not-open'));
});
