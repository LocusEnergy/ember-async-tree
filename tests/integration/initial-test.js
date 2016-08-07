import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import without from 'lodash/array/without';

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

test('setting an on-open action changes the open nodes list', function(assert){
  this.render(hbs`
    {{#async-tree
      initial=initial
      on-open=appendNodes
      fetch=fetchChildren
      as |node|}}
      {{node.name}}
    {{/async-tree}}
  `);

  this.set('initial', [ FIRST_PARENT ]);
  this.set('fetchChildren', () => [ FIRST_CHILD, FIRST_GRANDCHILD ]);
  this.set('appendNodes', (node, openNodes) => openNodes.concat(node));

  assert.deepEqual(this.asyncTree.itemsText(), [
    'first parent'
  ]);
  assert.ok(this.asyncTree.isNotOpenItem('first parent'));

  // open the node.
  this.asyncTree.open('first parent');
  assert.ok(this.asyncTree.isOpenItem('first parent'));
  assert.deepEqual(this.asyncTree.itemsText(), [
    'first parent',
    'first child',
    'first grandchild'
  ]);
});

test('setting an on-close action changes the open nodes list', function(assert){
  this.render(hbs`
    {{#async-tree
      initial=initial
      on-close=removeNodes
      fetch=fetchChildren
      as |node|}}
      {{node.name}}
    {{/async-tree}}
  `);

  this.set('initial', [ FIRST_PARENT, FIRST_CHILD, FIRST_GRANDCHILD ]);
  this.set('fetchChildren', () => []);
  this.set('removeNodes', (node, openNodes) => without(openNodes, node));

  assert.deepEqual(this.asyncTree.itemsText(), [
    'first parent',
    'first child',
    'first grandchild'
  ]);

  // close the parent node.
  this.asyncTree.close('first parent');
  assert.ok(this.asyncTree.isNotOpenItem('first child'));
  assert.ok(this.asyncTree.isNotOpenItem('first grandchild'));
});

test('disable indent styles and level classnames', function(assert) {
  let initial = [ FIRST_PARENT, FIRST_CHILD, FIRST_GRANDCHILD ];

  this.set('initial', initial);

  this.set('initialFilter', FILTER);

  this.render(hbs`
    {{#async-tree
      initial=initial
      initial-filter=initialFilter
      styleIndent=false
      as |node|}}{{node.name}}
    {{/async-tree}}`);

  assert.equal(this.$('.node-list-item:eq(0)').css('margin-left'), '0px', 'first node is not indented');
  assert.ok(this.$('.node-list-item:eq(0)').hasClass('level-0'), 'has correct level class');
  assert.equal(this.$('.node-list-item:eq(1)').css('margin-left'), '0px', 'second node is not indented');
  assert.ok(this.$('.node-list-item:eq(1)').hasClass('level-1'), 'has correct level class');
  assert.equal(this.$('.node-list-item:eq(2)').css('margin-left'), '0px', 'third node is not indented');
  assert.ok(this.$('.node-list-item:eq(2)').hasClass('level-2'), 'has correct level class');
});
