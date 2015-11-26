import Ember from 'ember';
import Loading from '../mixins/loading';

const {
  computed,
  RSVP
} = Ember;

export default Ember.Component.extend(Loading, {

  classNameBindings: [
    ':async-tree-node',
    'isOpen:is-open:is-not-open',
    'isLoaded:is-loaded:is-not-loaded',
    'isLoading:is-loading'
  ],

  nextDepth: computed('depth', {
    get() {
      return this.get('depth') + 1;
    }
  }),

  setIsOpen(value) {
    this.set('isOpen', value);
  },

  setChildren(children) {
    this.set('_children', children);
  },

  _fetch(node){
    node = node || this.get('node');

    this.startLoading();
    let fetch = this.get('fetch');
    let fetched = fetch(node);

    let promise = fetched && fetched.then ? fetched : RSVP.resolve(fetched);
    promise.then((children)=>{
      this.setChildren(children);
      this.finishLoading();
      return children;
    });

    this.set('_promise', promise);
    return promise;
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
      this.sendAction('open', node);
      this.setIsOpen(true);
    },
    close(node) {
      this.sendAction('close', node);
      this.setIsOpen(false);
    }
  }

});
