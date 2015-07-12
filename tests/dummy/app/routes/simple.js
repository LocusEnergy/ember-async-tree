// BEGIN-SNIPPET simple-route
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return [
      {type: 'character', name: 'George Costanza'},
      {type: 'character', name: 'Cosmo Kramer'}
    ];
  }
});
// END-SNIPPET
