// BEGIN-SNIPPET paginated-route
import Ember from 'ember';
import range from 'lodash/utility/range';

export default Ember.Route.extend({
  model() {
    const results = range(10).map(function(index){
      return {
        name: `Item ${index} (from model)`
      };
    });
    results.meta = {
      page: 1,
      pages: 10
    };
    return results;
  }
});
// END-SNIPPET
