import Ember from 'ember';
import range from 'lodash/utility/range';

export default Ember.Controller.extend({
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
    fetch(node, meta = {}) {
      if (node) {
        const {name} = node;
        return range(50).map(function(i){
          return {
            name: `Item ${i} (child of ${name})`
          };
        });
      }
      const { last } = meta;
      const more = this.getMore(last, 50);
      return new Ember.RSVP.Promise((resolve)=>{
        Ember.run.later(resolve, more, 200);
      });
    },
    checkHasMore({ last }) {
      const data = this.get('model');
      return last < data.length;
    }
  }
});
