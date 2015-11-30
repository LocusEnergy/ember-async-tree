import Ember from 'ember';
import flattenDeep from 'lodash/array/flattenDeep';
import invoke from 'lodash/collection/invoke';
import compact from 'lodash/array/compact';
import toArray from 'lodash/lang/toArray';

export default class Node {
  constructor(options = {}, parent) {
    this.parent = parent;
    this.content = options.content;
    this.depth = options.depth == null ? -1 : options.depth;
    this.children = new Ember.Map();
  }

  addChildren(children) {
    return children.map(this.addChild, this);
  }

  addChild(item) {
    let node = new Node({
      content: item,
      depth: this.depth + 1
    }, this);
    this.children.set(item, node);
    return node;
  }

  getChild(item) {
    return this.children.get(item);
  }

  getChildren() {
    let children = [];
    this.children.forEach( child => children.push(child) );
    return children;
  }

  flatten() {
    let branch = [];
    if (this.content) {
      branch.push(this);
    }
    branch.push(invoke(this.getChildren(), 'flatten'));
    return toArray(compact(flattenDeep(branch)));
  }
}
