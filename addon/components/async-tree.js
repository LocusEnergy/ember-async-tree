import Ember from 'ember';
import AsyncTreeLayout from 'ember-async-tree/templates/async-tree';
import required from 'ember-async-tree/computed/required';

const {
  on,
  get,
  computed,
  observer,
  isNone,
  isEmpty
} = Ember;

export default Ember.Component.extend({
  layout: AsyncTreeLayout,
  classNameBindings: [
    'hasNoNode:async-tree:async-tree-node',
    'isOpen:is-open:is-not-open',
    'isLoaded:is-loaded:is-not-loaded',
    'isLoading:is-loading'
  ],

  depth: 0,
  "expand-only-child": false,
  "fetch-on-init": false,

  checkOpen: required(),
  fetch: required(),

  didReceiveAttrs(attrs) {
    let children = newValue(attrs, 'children');
    const initialData = newValue(attrs, 'initialData');

    if (didChange(attrs, 'children') && !isNone(children)) {
      this.set('_children', children);
      return;
    }

    if (didChange(attrs, 'initialData')) {
      if (isNone(initialData)) {
        this.set('isOpen', false);
      } else {
        children = this.getChildren(initialData, this.get('node'));
        this.setProperties({
          _children: children,
          isOpen: children.length > 0
        });
      }
    }
  },

  getChildren(data, parent) {
    const childrenFilter = this.get('children-filter') || this.get('childrenFilter');
    return childrenFilter(data, parent);
  },
  childrenFilter: computed({
    get() {
      return (data) => {
        const nextDepth = this.get('nextDepth') - 1;
        const hasNextNode = !isNone(data[nextDepth]);
        if (hasNextNode) {
          return [data[nextDepth]];
        }
      };
    }
  }),
  nextDepth: computed('depth', {
    get() {
      return this.get('depth') + 1;
    }
  }),
  hasNoNode: computed.none('node'),
  hasNode: computed.not('hasNoNode'),
  hasChildren: computed.not('hasNoChildren'),
  hasNoChildren: computed.empty('_children'),
  hasParent: computed.not('parent'),
  hasNoParent: computed.none('parent'),
  isNotLoaded: computed.none('_children'),
  isLoaded: computed.not('isNotLoaded'),

  isOpen: computed('checkOpen', 'node', {
    get() {
      let node = this.get('node');
      if (node == null) {
        // the tree root doesn't have a root and it should always be open
        return true;
      }
      let checkOpen = this.get('checkOpen');
      return checkOpen(node);
    }
  }),
  fetchData: function() {
    this.set('isLoading', true);
    let promise = this._fetch()
      .then((children)=>{
        this.set('_children', children);
        this.set('isLoading', false);
        return children;
      });
    this.set('promise', promise);
    return promise;
  },
  _fetch: function(){
    const fetch = this.get('fetch');
    return fetch(this.get('node'));
  },
  _open() {
    const node = this.get('node');
    const isLoaded = this.get('isLoaded');
    if (isLoaded) {
      this.send('open', node);
    } else {
      this.fetchData().then(()=>{
        this.send('open', node);
      });
    }
   },
  _close: on('willDestroyElement', function(){
    let node = this.get('node');
    this.send('close', node);
  }),
  click() {
    let isOpen = this.get('isOpen');
    if (isOpen) {
      this._close();
    } else {
      this._open();
    }
    return false;
  },
  actions: {
    open(node) {
      this.sendAction('open', node);
    },
    close(node) {
      this.sendAction('close', node);
    }
  }
});

function oldValue(attrs, key) {
  const { oldAttrs = {} } = attrs;
  return get(oldAttrs, `${key}.value`);
}

function newValue(attrs, key) {
  const { newAttrs } = attrs;
  return get(newAttrs, `${key}.value`);
}

function didChange(attrs, key) {
  const {
    oldAttrs = {},
    newAttrs
  } = attrs;
  return get(oldAttrs, `${key}.value`) !== get(newAttrs, `${key}.value`);
}
