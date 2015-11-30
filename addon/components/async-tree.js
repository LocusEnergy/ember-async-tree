import Ember from 'ember';
import Loading from '../mixins/loading';
import without from 'lodash/array/without';
import Node from '../utils/node';
import includes from 'lodash/collection/includes';

const {
  isPresent,
  computed,
  isNone
} = Ember;

export default Ember.Component.extend(Loading, {
  classNameBindings: [':async-tree', 'isLoading'],

  'row-height': 20,

  init() {
    this._super(...arguments);

    let root = new Node();
    let openNodes = root.load(this.get('initial'), this.get('initial-filter'));

    this.set('openNodes', openNodes);
  },

  setRoot(root) {
    this.setProperties({
      _tree: root,
      _flattened: root.flatten()
    });
  },

  visibleNodes: computed('_tree', 'openNodes.[]', '_flattened.[]', {
    get() {
      let openNodes = this.get('openNodes');
      let root = this.get('_tree');
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

  afterFetch() {
    this.finishLoading();
  },

  actions: {
    initialFilter(node) {
      this.setupInitial(node);
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
