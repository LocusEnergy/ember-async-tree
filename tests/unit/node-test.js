import {module, test} from 'qunit';
import Node from 'ember-async-tree/utils/node';

const {
  isNone
} = Ember;

module('unit: Node class');

const FIRST_PARENT = { name: 'first parent', type: 'parent' };
const SECOND_PARENT = { name: 'second parent', type: 'parent' };
const THIRD_PARENT = { name: 'third parent', type: 'parent' };
const FIRST_CHILD = { name: 'first child', type: 'child' };
const SECOND_CHILD = { name: 'second child', type: 'child' };
const THIRD_CHILD = { name: 'third child', type: 'child' };
const FIRST_GRANDCHILD = { name: 'first grandchild'};
const SECOND_GRANDCHILD = { name: 'second grandchild' };
const THIRD_GRANDCHILD = { name: 'third grandchild' };

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
