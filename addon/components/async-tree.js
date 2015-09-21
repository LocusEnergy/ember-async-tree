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

  fetch: required(),

  init() {
    this._super(...arguments);
    const isRoot = isNone(this.get('node'));
    if (isRoot) {
      this.setIsOpen(true);
    } else if (!isEmpty(this.get('children'))) {
      this.setIsOpen(true);
    }
  },

  didReceiveAttrs(attrs) {
    let children = newValue(attrs, 'children');
    const initialData = newValue(attrs, 'initialData');

    if (didChange(attrs, 'children') && !isNone(children)) {
      this.set('_children', children);
      return;
    }

    if (didChange(attrs, 'initialData')) {
      if (isNone(initialData)) {
        this.setIsOpen(false);
      } else {
        const node = this.get('node');
        children = this.getChildren(initialData, node);
        this.set('_children', children);
        if (children.length > 0) {
          this.send('open', node);
        }
      }
    }
  },
  setIsOpen(value) {
    this.set('isOpen', value);
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
  actions: {
    toggleOpen() {
      let isOpen = this.get('isOpen');
      if (isOpen) {
        this._close();
      } else {
        this._open();
      }
    },
    open(node) {
      this.attrs.open(node);
      this.setIsOpen(true);
    },
    close(node) {
      this.attrs.close(node);
      this.setIsOpen(false);
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
