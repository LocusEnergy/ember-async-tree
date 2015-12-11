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

    assert.deepEqual(this.asyncTree.itemsText(), [
        'first parent',
        'second parent',
        'third parent'
    ]);
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

  assert.deepEqual(this.asyncTree.itemsText(), [
    'first parent',
    'first child',
    'first grandchild'
  ]);

  assert.ok(this.asyncTree.isOpenItem('first parent'), 'first parent is open');
  assert.ok(this.asyncTree.isOpenItem('first child'), 'first child is open');
  assert.ok(this.asyncTree.isNotOpenItem('first grandchild'), 'first granchiuld is not open');
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

    assert.deepEqual(this.asyncTree.itemsText(), [
        'first parent',
        'first child',
        'first grandchild'
    ]);

  this.set('initial', [ SECOND_PARENT, SECOND_CHILD, SECOND_GRANDCHILD ]);

  assert.deepEqual(this.asyncTree.itemsText(), [
      'second parent',
      'second child',
      'second grandchild'
  ]);

  assert.ok(this.asyncTree.isOpenItem('second parent'), 'second parent is open');
  assert.ok(this.asyncTree.isOpenItem('second child'), 'second child is open');
  assert.ok(this.asyncTree.isNotOpenItem('second grandchild'), 'second granchild is not open');
});

test('no data uses inverse template', function(assert){
  this.render(hbs`
    {{#async-tree initial=initial as |node|}}
      {{node.name}}
    {{else}}
      Nothing to show
    {{/async-tree}}
  `);

  assert.ok(this.asyncTree.isEmpty(), 'async tree is empty with undefined');
  assert.equal(this.asyncTree.emptyText(), 'Nothing to show', 'Inverse message shown with undefined');

  this.set('initial', []);

  assert.ok(this.asyncTree.isEmpty(), 'async tree is empty with empty array');
  assert.equal(this.asyncTree.emptyText(), 'Nothing to show', 'Inverse message shown with undefined');

  this.set('initial', [ FIRST_PARENT ]);

  assert.ok(!this.asyncTree.isEmpty(), 'async tree is not empty');
  assert.equal(this.asyncTree.emptyText(), '', 'Inverse message is empty');
});
