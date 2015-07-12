import Ember from 'ember';
import AsyncTreeTemplate from 'ember-async-tree/templates/async-tree';
import required from 'ember-async-tree/computed/required';

const {on, get, computed} = Ember;

export default Ember.Component.extend({
  template: AsyncTreeTemplate,
  classNameBindings: [
    'hasParent::async-tree',
    ':async-tree-node',
    'isOpen:is-open:is-not-open',
    'isLoaded:is-loaded:is-not-loaded',
    'isLoading:is-loading'
  ],

  "expand-only-child": false,
  "fetch-on-init": false,

  checkOpen: required(),
  fetch: required(),

  initialData: on('init', function(){
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
  }),
  hasNoNode: computed.none('node'),
  hasNode: computed.not('hasNoNode').
  hasChildren: computed.gt('children.length', 0),
  hasParent: computed.notEmpty('parent'),
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
        return children;
      })
      .finally(()=>{
        this.set('isLoading', false);
      });
    this.set('promise', promise);
    return promise;
  },
  _fetch: function(){
    let fetch = this.get('fetch');
    return fetch(this.get('node'));
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
