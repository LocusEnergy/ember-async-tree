import {module, test} from 'qunit';
import Node from 'ember-async-tree/utils/node';

module('unit: Node class');

const FIRST_PARENT = { name: 'first parent' };
const SECOND_PARENT = { name: 'second parent' };
const FIRST_CHILD = { name: 'first child' };
const SECOND_CHILD = { name: 'second child' };
const THIRD_CHILD = { name: 'third child' };
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
