import Ember from 'ember';
import { module, test } from 'qunit';

import {
  FIRST_PARENT,
  SECOND_PARENT,
  FIRST_CHILD,
  SECOND_CHILD,
  FIRST_GRANDCHILD,
  SECOND_GRANDCHILD,
  FILTER
} from '../helpers/constants';

import AsyncTreeComponent from 'ember-async-tree/components/async-tree';

const {
  get
} = Ember;

module('unit: async-tree component');

test('flattened data is ordered correctly when initial data is chagned', function(assert){

  let component = AsyncTreeComponent.create();

  component.setProperties({
    initial: [ FIRST_PARENT, FIRST_CHILD, FIRST_GRANDCHILD ],
    'initial-filter': FILTER
  });

  component.updateInitial();

  let visibleNodes = get(component, 'visibleNodes');

  assert.equal(visibleNodes.length, 3, '3 nodes are visible');
  assert.equal(get(visibleNodes[0], 'content.name'), 'first parent');
  assert.equal(get(visibleNodes[1], 'content.name'), 'first child');
  assert.equal(get(visibleNodes[2], 'content.name'), 'first grandchild');

  component.set('initial', [ SECOND_PARENT, SECOND_CHILD, SECOND_GRANDCHILD ]);

  component.updateInitial();

  visibleNodes = get(component, 'visibleNodes');
  assert.equal(visibleNodes.length, 3, '3 nodes are visible');
  assert.equal(get(visibleNodes[0], 'content.name'), 'second parent');
  assert.equal(get(visibleNodes[1], 'content.name'), 'second child');
  assert.equal(get(visibleNodes[2], 'content.name'), 'second grandchild');

});
