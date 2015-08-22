import Ember from 'ember';
import AsyncTreeLayout from 'ember-async-tree/templates/async-tree';
import required from 'ember-async-tree/computed/required';

const {
  on,
  get,
  computed,
  observer,
  isNone,
  isEmpty,
  RSVP,
  A
} = Ember;

const {
  resolve
} = RSVP;

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

  _initialize: on('init', function(){
    this.setupFetchOnInit();
    this.setupInitialData();
  }),
  setupFetchOnInit() {
    const expandOnlyChild = this.get('expand-only-child');
    const fetchOnInit = this.get('fetch-on-init');
    const hasChildren = this.get('hasChildren');
    let promise;
    if (!hasChildren && fetchOnInit) {
      promise = this.fetchData();
    }
    if (!hasChildren && fetchOnInit && expandOnlyChild) {
      promise.then((children)=>{
        children = new A(children);
        if (children.length === 1) {
          this.sendAction('open', get(children, 'firstObject'));
        }
      });
    }
  },
  setupInitialData: observer('initialData', function() {
    const data = this.get('initialData');
    if (data) {
      const children = this.getChildren(data, this.get('node'));
      if (!isEmpty(children)) {
        this.setProperties({
          children: children,
          isOpen: true
        });
      }
    }
  }),
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
          return new A([data[nextDepth]]);
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
  hasNoChildren: computed.empty('children'),
  hasParent: computed.not('parent'),
  hasNoParent: computed.none('parent'),
  isNotLoaded: computed.none('children'),
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
  setMeta(children) {
    if (children) {
      this.set('meta', get(children, 'meta'));
    }
  },
  appendChildren(children = []) {
    let _children = this.get('children');
    if (!_children) {
      _children = new A();
      this.set('children', _children);
    }
    _children.pushObjects(children);
  },
  startLoading() {
    this.set('isLoading', true);
  },
  finishLoading() {
    this.set('isLoading', false);
  },
  fetchData: function(node, meta) {
    this.startLoading();
    let promise = this._fetch(node, meta)
      .then((children)=>{
        this.setMeta(children);
        this.appendChildren(children);
        return children;
      })
      .finally((children)=>{
        this.finishLoading();
        return children;
      });
    this.set('promise', promise);
    return promise;
  },
  _fetch: function(node, meta){
    node = node || this.get('node');

    const fetch = this.get('fetch');
    let result = fetch(node, meta);
    return result && result.then ? result : resolve(result);
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
  hasMore: computed('checkHasMore', 'meta', {
    get() {
      const checkHasMore = this.get('checkHasMore');
      if (!checkHasMore) {
        return;
      }
      const node = this.get('node');
      const meta = this.get('meta');
      return checkHasMore(node, meta);
    }
  }),
  actions: {
    open(node) {
      this.sendAction('open', node);
    },
    close(node) {
      this.sendAction('close', node);
    },
    toggle() {
      let isOpen = this.get('isOpen');
      if (isOpen) {
        this._close();
      } else {
        this._open();
      }
    },
    more(node, meta) {
      this.fetchData(node, meta);
    }
  }
});
