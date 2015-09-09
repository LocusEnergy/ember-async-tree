import Ember from 'ember';

import AsyncTreeLayout from 'ember-async-tree/templates/async-tree';
import Fetch from 'ember-async-tree/mixins/fetch';

const {
  computed,
  A,
  isNone,
  isEmpty
} = Ember;

export default Ember.Component.extend(Fetch, {
  layout: AsyncTreeLayout,
  classNames: ['async-tree'],
  _setup: false,

  init() {
    this._super(...arguments);
    const openNodes = this.get('openNodes');
    if (isNone(openNodes)) {
      this.set('openNodes', new A());
    }
  },

  didReceiveAttrs({oldAttrs: previous = {}, newAttrs: current}){
    this._super(...arguments);
    const hasNewData = previous.data !== current.data;
    const data = this.get('data');
    if (hasNewData && !isEmpty(data)) {
      this.injectData();
    };

    if (!this.get('_setup')) {
      this.setup();
      this.set('_setup', true);
    }
  },

  setup() {
    const fetchOnInit = this.get('fetch-on-init');
    if (fetchOnInit) {
      this._fetch();
    }
  },

  actions: {
    open(node) {
      const openNodes = this.get('openNodes');
      openNodes.pushObject(node);
      this.sendAction('on-open', openNodes);
    },
    close(node) {
      const openNodes = this.get('openNodes');
      openNodes.removeObject(node);
      this.sendAction('on-close', openNodes);
    },
    checkOpen(node) {
      const openNodes = this.get('openNodes');
      return openNodes.contains(node);
    },
    filterData(data){
      const nextDepth = this.get('nextDepth') - 1;
      const hasNextNode = !isNone(data[nextDepth]);
      if (hasNextNode) {
        return [data[nextDepth]];
      }
    }
  }
});
