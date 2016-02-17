import Ember from 'ember';
import { module, test } from 'qunit';

import Node from 'ember-async-tree/utils/node';
import {
  FIRST_PARENT,
  SECOND_PARENT,
  THIRD_PARENT,
  FIRST_CHILD,
  SECOND_CHILD,
  THIRD_CHILD,
  FIRST_GRANDCHILD,
  SECOND_GRANDCHILD,
  THIRD_GRANDCHILD
} from '../helpers/constants';

const {
  isNone,
  get
} = Ember;

module('unit: Node class');

test('adding children creates a tree of nodes', function(assert){

  let root = new Node();

  root.addChildren([ FIRST_CHILD, SECOND_CHILD, THIRD_CHILD ]);

  assert.equal(root.getChild(FIRST_CHILD).content, FIRST_CHILD);
  assert.equal(root.getChild(SECOND_CHILD).content, SECOND_CHILD);
  assert.equal(root.getChild(THIRD_CHILD).content, THIRD_CHILD);
});

test('flatten recursively to an array', function(assert){
  let root = new Node();

  let [firstParent, secondParent] = root.addChildren([ FIRST_PARENT, SECOND_PARENT ]);

  let [firstChild, secondChild] = firstParent.addChildren([FIRST_CHILD, SECOND_CHILD]);
  let thirdChild = secondParent.addChild(THIRD_CHILD);

  let firstGrandchild = firstChild.addChild(FIRST_GRANDCHILD);
  let thirdGrandchild = secondChild.addChild(THIRD_GRANDCHILD);
  let secondGrandchild = thirdChild.addChild(SECOND_GRANDCHILD);

  /**
   * root
   *  - first parent
   *    - first child
   *      - first grandchild
   *    - second child
   *      - third grandchild
   *  - second parent
   *    - third child
   *      - second grandchild
   */

  assert.deepEqual(root.flatten(), [
    firstParent,
    firstChild,
    firstGrandchild,
    secondChild,
    thirdGrandchild,
    secondParent,
    thirdChild,
    secondGrandchild
  ]);
});

test('child node references parent', function(assert){

  let root = new Node();

  assert.equal(root.parent, undefined, "root's parent is undefined");

  let firstChild = root.addChild(FIRST_CHILD);

  assert.equal(firstChild.parent, root, "child's parent references parent node");

});

test('node.load injects nodes into tree and returns array of open nodes', function(assert){

  /**
   * root
   *  - first parent
   *    - first child
   *  - second parent
   *    - second child
   *  - third parent
   *
   *  open nodes: first parent, second parent, third parent
   */

  let filter = function(items, item) {
    let isRoot = isNone(item);
    if (isRoot) {
      return items.filter(function(i){
        return i.type === 'parent';
      });
    }
    if (item.type === 'parent') {
      if (item.name === 'first parent') {
        return [ FIRST_CHILD ];
      } else {
        return [ SECOND_CHILD ];
      }
    }
  };

  let { root, openNodes } = Node.load([
    FIRST_PARENT,
    SECOND_PARENT,
    THIRD_PARENT,
    FIRST_CHILD,
    SECOND_CHILD
  ], filter);

  assert.deepEqual(openNodes.map(function(item){
    return item.content;
  }), [
    FIRST_PARENT,
    SECOND_PARENT,
    THIRD_PARENT
  ], 'parents are open');

  assert.ok(root.hasChild(FIRST_PARENT), 'first parent is child of root');
  assert.ok(root.hasChild(SECOND_PARENT), 'second parent is child of root');
  assert.ok(root.hasChild(THIRD_PARENT), 'third parent is child of root');

});

test('node.parents() returns array of parents', function(assert){

  let root = new Node();

  let firstParent = root.addChild(FIRST_PARENT);

  let firstChild = firstParent.addChild(FIRST_CHILD);

  let firstGrandchild = firstChild.addChild(FIRST_GRANDCHILD);

  assert.deepEqual(getNames(firstParent.parents()), []);
  assert.deepEqual(getNames(firstChild.parents()), [ 'first parent' ]);
  assert.deepEqual(getNames(firstGrandchild.parents()), [ 'first child', 'first parent' ]);

});

test('node.addChildren() should add children', function(assert){

  let root = new Node();
  let result = root.addChildren([ FIRST_PARENT ]);
  assert.deepEqual(getNames(result), [ 'first parent' ]);

  let [ firstParent ] = result;
  let children = firstParent.addChildren([ FIRST_CHILD, SECOND_CHILD ]);

  assert.deepEqual(getNames(children), ['first child', 'second child']);
});

test('node.addChildren() should add children and grandchildren', function(assert){
  assert.expect(14);

  let root = new Node();
  let result = root.addChildren([
    {
      content: FIRST_PARENT,
      children: [
        FIRST_CHILD, SECOND_CHILD
      ]
    }
  ]);

  let [ parentNode ] = result;
  let children = parentNode.getChildren();

  assert.ok(parentNode.isLoaded, 'parent node is marked as loaded');
  assert.equal(children.length, 2, '2 children were added to parent node');
  assert.deepEqual(getNames(children), ['first child', 'second child']);

  root = new Node();

  result = root.addChildren([
    {
      content: FIRST_PARENT,
      children: [
        {
          content: FIRST_CHILD,
          children: [ FIRST_GRANDCHILD ]
        },
        {
          content: SECOND_CHILD,
          children: [ SECOND_GRANDCHILD ]
        }
      ]
    }
  ]);

  [ parentNode ] = result;
  let [ firstChild, secondChild ] = parentNode.getChildren();
  let firstGrandchildren = firstChild.getChildren();
  let secondGrandchildren  = secondChild.getChildren();

  assert.ok(parentNode.isLoaded, 'parent node is marked as loaded');

  assert.ok(firstChild, 'first child is present');
  assert.ok(firstChild.isLoaded, 'first child is marked as loaded');
  assert.ok(secondChild, 'second child is present');
  assert.ok(secondChild.isLoaded, 'second child is marked as loaded');

  assert.equal(firstGrandchildren.length, 1, 'first child has one grandchild');
  assert.notOk(firstGrandchildren.isLoaded, 'first grandchild is not loaded');
  assert.equal(secondGrandchildren.length, 1, 'second child has one grandchild');
  assert.notOk(secondGrandchildren.isLoaded, 'second grandchild is not loaded');
  assert.deepEqual(getNames(firstGrandchildren), ['first grandchild' ]);
  assert.deepEqual(getNames(secondGrandchildren), ['second grandchild' ]);
});

function getNames(nodes) {
  return nodes.map(function(node){
    return get(node, 'content.name');
  });
}
