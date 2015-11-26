import Ember from 'ember';
import Loading from '../mixins/loading';
import without from 'lodash/array/without';

const {
  isPresent,
  computed,
  isNone
} = Ember;

export default Ember.Component.extend(Loading, {
  classNames: 'async-tree',

  'item-tag-name': 'div',

  'row-height': 20,

  init() {
    this.set('openNodes', []);
    this._super(...arguments);
    this.setupInitial();
  },

  setupInitial(node) {
    let initial = this.get('initial');
    let filterFn = this.get('initial-filter');

    let children;
    if (isPresent(initial)) {
      if (isPresent(filterFn)) {
        children = initial.filter((item)=>{
          return filterFn(item, node);
        });
      } else {
        children = initial;
      }
      this.set('_children', children);
    }
  },

  didReceiveAttrs() {
    let openNodes = this.set('open-nodes');
    if (!isNone(openNodes)) {
      this.set('openNodes', openNodes);
    }
  },

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
  },

  afterFetch() {
    this.finishLoading();
  },

  actions: {
    initialFilter(node) {
      this.getInitial(node);
    },
    fetch(node) {
      let fetch = this.get('fetch');
      this.startLoading();
      return fetch(node)
        .then(this.extractMeta.bind(this))
        .finally(this.afterFetch.bind(this));
    },
    more(node, meta) {
      this._fetch(node, meta);
    },
    open(node) {
      let open = this.get('open');
      if (isPresent(open)) {
        open(node);
        return;
      }
      let openNodes = this.get('openNodes');
      this.set('openNodes', openNodes.concat(node));
    },
    close(node) {
      let close = this.get('close');
      if (isPresent(close)) {
        close(node);
        return;
      }
      let openNodes = this.get('openNodes');
      this.set('openNodes', without(openNodes, node));
    }
  }
});
