import Ember from 'ember';
import Loading from '../mixins/loading';
import without from 'lodash/array/without';
import Node from '../utils/node';
import includes from 'lodash/collection/includes';

const {
  computed,
  set
} = Ember;

export default Ember.Component.extend(Loading, {
  classNameBindings: [':async-tree', 'isLoading'],

  'row-height': 20,

  init() {
    this._super(...arguments);

    let { root, openNodes } = Node.load(this.get('initial'), this.get('initial-filter'));

    this.setRoot(root);
    this.set('openNodes', openNodes);
  },

  setRoot(root) {
    this.setProperties({
      _root: root,
      _flattened: root.flatten()
    });
  },

  visibleNodes: computed('_root', 'openNodes.[]', '_flattened.[]', {
    get() {
      let openNodes = this.get('openNodes');
      let root = this.get('_root');
      let flattened = this.get('_flattened');
      return flattened.filter(function(node){
        return node.parent === root || includes(openNodes, node.parent);
      });
    }
  }),

  hasMore: computed('meta', 'check-has-more', {
    get() {
      const meta = this.get('meta');
      const checkHasMore = this.get('check-has-more');
      if (meta && checkHasMore) {
        return checkHasMore(meta);
      }
    }
  }),

  extractMeta(children) {
    let {meta} = children;
    this.set('meta', meta);
    return children;
  },

  startLoading(node) {
    this.set('isLoading', node);
    set(node, 'isLoading', true);
  },

  finishLoading(node) {
    this.set('isLoading', null);
    set(node, 'isLoading', false);
  },

  afterFetch() {
    this.finishLoading();
  },

  updateFlattened() {
    let root = this.get('_root');
    this.set('_flattened', root.flatten());
  },

  addChildren(node, children) {
    node.addChildren(children);
    this.updateFlattened();
  },

  markLoaded(node) {
    set(node, 'isLoaded', true);
  },

  openNode(node) {
    let openNodes = this.get('openNodes');
    this.set('openNodes', openNodes.concat(node));
  },

  closeNode(node) {
    let openNodes = this.get('openNodes');
    this.set('openNodes', without(openNodes, node));
  },

  _open(node) {
    if (node.isLoaded) {
      this.openNode(node);
      return;
    }
    this._fetch(node).then((children)=>{
      this.addChildren(node, children);
      this.markLoaded(node);
      this.openNode(node);
      return children;
    });
  },

  _close(node) {
    this.closeNode(node);
  },

  _fetch(node){
    let { content } = node;

    this.startLoading(node);
    let fetch = this.get('fetch');
    let fetched = fetch(content);

    let promise = fetched && fetched.then ? fetched : RSVP.resolve(fetched);

    promise.finally(()=>{
      this.finishLoading(node);
    });

    return promise;
  },

  actions: {
    toggle(node) {
      let openNodes = this.get('openNodes');
      let isOpen = includes(openNodes, node);
      if (isOpen) {
        this._close(node);
      } else {
        this._open(node);
      }
    },
    fetchChildren(node) {
      let fetch = this.get('fetch');
      this.startLoading();
      return fetch(node).finally(this.afterFetch.bind(this));
    },
    fetchMore(meta) {
      let fetch = this.get('fetch');
      this.startLoading();
      return fetch(node)
        .then(this.extractMeta.bind(this))
        .finally(this.afterFetch.bind(this));
    }
  }
});
