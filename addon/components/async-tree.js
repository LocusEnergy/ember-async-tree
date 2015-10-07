import Ember from 'ember';
import AsyncTreeLayout from 'ember-async-tree/templates/async-tree';

const {
  get,
  computed,
  isNone,
  isEmpty,
  K,
  RSVP
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
      this.updateChildren(children);
      return;
    }

    if (didChange(attrs, 'initialData')) {
      if (isNone(initialData)) {
        this.setIsOpen(false);
      } else {
        const node = this.get('node');
        children = this.getChildren(initialData, node);
        this.updateChildren(children);
        if (children && children.length > 0) {
          this.send('open', node);
        }
      }
    }
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

  hasMore: computed('node', 'meta', 'check-has-more', {
    get() {
      const meta = this.get('meta');
      const node = this.get('node');
      const checkHasMore = this.get('check-has-more');
      if (meta && checkHasMore) {
        return checkHasMore(node, meta);
      }
    }
  }),

  setIsOpen(value) {
    this.set('isOpen', value);
  },

  getChildren(data, parent) {
    const childrenFilter = this.get('children-filter') || this.get('childrenFilter');
    return childrenFilter(data, parent);
  },

  updateChildren(children, isAppend=false) {
    if (isAppend) {
      children = (this.get('_children') || []).concat(children);
    }
    this.set('_children', children);
  },

  setMeta(children = []) {
    this.set('meta', children.meta);
  },

  _fetch: function(node, meta){
    node = node || this.get('node');
    meta = meta || this.get('meta');
    const isAppend = !!meta;

    this.startLoading();
    const fetch = this.get('fetch');
    const fetched = fetch(node, meta);

    const promise = fetched && fetched.then ? fetched : RSVP.resolve(fetched);
    promise.then((children)=>{
      this.updateChildren(children, isAppend);
      this.setMeta(children);
      this.finishLoading();
      return children;
    });
    this.set('promise', promise);

    return promise;
  },

  startLoading() {
    this.set('isLoading', true);
  },

  finishLoading() {
    this.set('isLoading', false);
  },

  _open() {
    const node = this.get('node');
    const isLoaded = this.get('isLoaded');
    if (isLoaded) {
      this.send('open', node);
    } else {
      this._fetch().then(()=>{
        this.send('open', node);
      });
    }
   },

  _close(){
    this.send('close', this.get('node'));
  },

  willDestroyElement() {
    this._super();
    this._close();
  },

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
      const open = this.get('open') || K;
      open(node);
      this.setIsOpen(true);
    },
    close(node) {
      const close = this.get('close') || K;
      close(node);
      this.setIsOpen(false);
    },
    more(node, meta) {
      this._fetch(node, meta);
    }
  }
});

function newValue(attrs, key) {
  const { newAttrs } = attrs;
  return get(newAttrs, `${key}.value`);
}

function didChange(attrs, key) {
  const oldAttrs = attrs.oldAttrs || {};
  const newAttrs = attrs.newAttrs;
  return get(oldAttrs, `${key}.value`) !== get(newAttrs, `${key}.value`);
}
