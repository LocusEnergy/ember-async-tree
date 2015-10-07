import Ember from 'ember';

export default Ember.Controller.extend({
  init() {
    this._super();
    this.set('openNodes', []);
  },
  initialData: Ember.computed('model', {
    get() {
      return this.getMore(0, 50);
    }
  }),
  getMore(first, count) {
    const last = first + count;
    const data = this.get('model').slice(first, last);
    data.meta = { last };
    return data;
  },
  actions: {
    open(node) {
      this.get('openNodes').addObject(node);
    },
    close(node) {
      this.get('openNodes').removeObject(node);
    },
    fetch(node, meta = {}) {
      const { last } = meta;
      const more = this.getMore(last, 50);
      return new Ember.RSVP.Promise((resolve)=>{
        Ember.run.later(resolve, more, 200);
      });
    },
    checkHasMore(node, meta) {
      const { last } = meta;
      const data = this.get('model');
      return last < data.length;
    }
  }
});
