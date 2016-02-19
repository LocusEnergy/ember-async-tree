import Ember from 'ember';
import flattenDeep from 'lodash/array/flattenDeep';
import invoke from 'lodash/collection/invoke';
import compact from 'lodash/array/compact';
import toArray from 'lodash/lang/toArray';
import intersection from 'lodash/array/intersection';

const {
  isEmpty,
  isNone,
  isPresent,
  set
} = Ember;

export default class Node {
  constructor(options, parent) {
    options = options || {};
    this.parent = parent;
    this.content = options.content;
    this.depth = options.depth == null ? -1 : options.depth;
    this.children = new Ember.Map();

    this.isLoading = false;
    this.isLoaded = false;
    this.isEmpty = null;
  }

  markLoaded() {
    this.isLoaded = true;
    set(this, 'isEmpty', this.children.size === 0);
  }

  addChildren(children) {
    return children.map(this.addChild, this);
  }

  addChild(item) {

    let children;

    if (!isNone(item.content) && !isNone(item.children)) {
      children = item.children;
      item = item.content;
    }

    let node = new Node({
      content: item,
      depth: this.depth + 1
    }, this);

    if (!isNone(children)) {
      node.markLoaded();
      node.addChildren(children);
    }

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

  hasChild(item) {
    return this.children.has(item);
  }

  flatten() {
    let branch = [];
    if (this.content) {
      branch.push(this);
    }
    branch.push(invoke(this.getChildren(), 'flatten'));
    return toArray(compact(flattenDeep(branch)));
  }

  parents() {
    return getParents(this.parent);
  }

  hasAllParents(openNodes) {
    let parents = this.parents();
    return intersection(parents, openNodes).length === parents.length;
  }

  /**
   * Return a tree with populated with data provided
   * @param items array
   * @param filter callback
   */
  static load(items, filter) {
    let root = new Node();
    return {
      root,
      openNodes: getChildren(items, filter, root)
    };
  }
}

function getChildren(items, filter, node) {
  let { content } = node;
  let isRoot = content === undefined;
  let _openNodes = [];

  let children;
  if (filter) {
    children = filter(items, content);
  } else if (isRoot) {
    children = items;
  }

  let nodeHasChildren = !isEmpty(children);

  if (nodeHasChildren) {
    let childNodes = node.addChildren(children);
    childNodes.forEach(function(childNode){
      _openNodes = _openNodes.concat(getChildren(items, filter, childNode));
    });
    if (isPresent(content)) {
      _openNodes.push(node);
    }
  }

  return _openNodes;
}

function getParents(node) {
  let { parent } = node;
  if (parent == null) {
    return [];
  }
  return [node].concat(getParents(parent));
}
