import Ember from 'ember';
import without from 'lodash/array/without';
import Node from '../utils/node';
import includes from 'lodash/collection/includes';
import ResizeAware from 'ember-resize/mixins/resize-aware';

const {
  computed,
  set,
  RSVP,
  isEmpty,
  isNone,
  Component
} = Ember;

export default Component.extend(ResizeAware, {
  resizeDebouncedEventsEnabled: false,
  classNameBindings: [':async-tree', 'isLoading'],

  'row-height': 20,
  indentation: 20,

  isInitialChanged: computed(
    'initial',
    '_initial',
    'initial-filter',
    '_initial-filter', {
      get() {
        return this.get('initial') !== this.get('_initial') ||
               this.get('initial-filter') !== this.get('_initial-filter');
      }
  }),

  didReceiveAttrs() {
    this._super(...arguments);

    this.updateInitial();
  },

  didInsertElement() {
    this._super(...arguments);

    this.set('width', this.$().width());
  },

  updateInitial() {
    if (this.get('isInitialChanged')) {
      let initial = this.get('initial');
      let initialFilter = this.get('initial-filter');
      let { root, openNodes } = Node.load(initial, initialFilter);

      this.setRoot(root);
      this.setProperties({
        openNodes,
        _initial: initial,
        '_initial-filter': initialFilter
      });
    }
  },

  didResize(width) {
    this.set('width', width);
  },

  setRoot(root) {
    this.set('_root', root);
    this.updateFlattened();
  },

  visibleNodes: computed(
    '_root',
    'openNodes.[]',
    '_flattened.[]',
    'hasMore', {
      get() {
        let root = this.get('_root');
        if (isNone(root)) {
          return;
        }

        let openNodes = this.get('openNodes');
        let flattened = this.get('_flattened');
        let hasMore = this.get('hasMore');

        let visible = flattened.filter(function (node) {
          return node.parent === root || node.hasAllParents(openNodes);
        });

        if (hasMore) {
          return visible.concat({isMore: true});
        }

        return visible;
      }
    }
  ),

  hasMore: computed('meta', 'check-has-more', {
    get() {
      const meta = this.get('meta');
      const checkHasMore = this.get('check-has-more');
      if (meta && checkHasMore) {
        return checkHasMore(meta);
      }
    }
  }),

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
    node.markLoaded();
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
      if (!isEmpty(children)) {
        this.addChildren(node, children);
      }
      this.markLoaded(node);
      this.openNode(node);
      return children;
    });
  },

  _close(node) {
    this.closeNode(node);
  },

  _fetch(node, meta){
    let { content } = node;

    this.startLoading(node);
    let fetch = this.get('fetch');
    let fetched = fetch(content, meta);

    let promise = fetched && fetched.then ? fetched : RSVP.resolve(fetched);

    promise.finally(()=>{
      this.finishLoading(node);
    });

    return promise;
  },

  style({ depth }) {
    let indentation = this.get('indentation');
    return `margin-left: ${indentation * depth}px`;
  },

  saveMeta(meta) {
    this.set('meta', meta);
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

    fetchMore(meta) {
      let node = this.get('_root');
      this._fetch(node, meta).then((children)=>{
        this.addChildren(node, children);
        let { meta } = children;
        this.saveMeta(meta);
        return children;
      });
    }

  }
});
