import Ember from 'ember';
import AsyncTreeLayout from 'ember-async-tree/templates/async-tree';
import required from 'ember-async-tree/computed/required';

const {on, get, computed, isNone} = Ember;

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

  initialize: on('init', function(){
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
      promise.then((children=[])=>{
        if (children.length === 1) {
          this.sendAction('open', get(children, 'firstObject'));
        }
      });
    }
  },
  setupInitialData() {
    const initialData = this.get('initialData');
    if (initialData) {
      const hasNoNode = this.get('hasNoNode');
      if (hasNoNode) {
        const depth = this.get('depth');
        this.set('node', initialData[depth]);
      }
      const nextDepth = this.get('nextDepth');
      const hasNextNode = !isNone(initialData[nextDepth]);
      if (hasNextNode) {
        this.setProperties({
          children: [initialData[nextDepth]],
          isOpen: true
        });
      }
    }
  },
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
  fetchData: function() {
    this.set('isLoading', true);
    let promise = this._fetch()
      .then((children)=>{
        this.set('children', children);
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
