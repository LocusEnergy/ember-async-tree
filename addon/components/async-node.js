import Ember from 'ember';
import AsyncNodeLayout from 'ember-async-tree/templates/async-node';
import Fetch from 'ember-async-tree/mixins/fetch';

const {
  computed,
  on
} = Ember;

export default Ember.Component.extend(Fetch, {
  layout: AsyncNodeLayout,
  classNameBindings: [
    ':async-tree-node',
    'is-open:is-open:is-not-open',
    'isLoaded:is-loaded:is-not-loaded',
    'isLoading:is-loading'
  ],

  hasNoNode: computed.none('node'),
  hasNode: computed.not('hasNoNode'),
  hasNodes: computed.not('hasNoNodes'),
  hasNoNodes: computed.empty('nodes'),
  hasParent: computed.not('parent'),
  hasNoParent: computed.none('parent'),
  isNotLoaded: computed.none('nodes'),
  isLoaded: computed.not('isNotLoaded'),

  nextDepth: computed('depth', {
    get() {
      return this.get('depth') + 1;
    }
  }),

  _open() {
    const isLoaded = this.get('isLoaded');
    const onOpen = this.get('on-open');
    const node = this.get('node');
    if (isLoaded) {
      onOpen(node);
    } else {
      this._fetch(node).then(function(){
        onOpen(node);
      });
    }
   },

   _close: on('willDestroyElement', function(){
     const onClose = this.get('on-close');
     const node = this.get('node');
     onClose(node);
   }),

   actions: {
     toggle() {
       if (this.get('is-open')) {
         this._close();
       } else {
         this._open();
       }
     }
   }
});
