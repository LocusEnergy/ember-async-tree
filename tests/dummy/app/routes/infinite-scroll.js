// BEGIN-SNIPPET infinite-scroll-route
import Ember from 'ember';
import range from 'lodash/utility/range';

export default Ember.Route.extend({
  model() {
    return range(300).map(function(index){
      return {
        name: `Item ${index} (from model)`
      };
    });
  }
});
// END-SNIPPET
