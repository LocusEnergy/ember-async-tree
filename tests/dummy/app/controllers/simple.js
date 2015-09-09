// BEGIN-SNIPPET simple-controller
import Ember from 'ember';

const {
  get,
  isNone
} = Ember;

const delay = Ember.testing ? 0 : 3000;

export default Ember.Controller.extend({
  actions: {
    fetch (node) {
      let result;
      if (isNone(node)) {
        result = [
          {type: 'character', name: 'George Costanza'},
          {type: 'character', name: 'Cosmo Kramer'}
        ];
      } else {
        let type = get(node, 'type');
        if (type === 'character') {
          result = [
            { type: 'location', name: 'Jerry\'s house' },
            { type: 'location', name: 'Dinner'}
          ];
        }
        if (type === 'location') {
          result = [
            { type: 'prop', name: 'Fork' },
            { type: 'prop', name: 'Shoe'}
          ];
        }
      }
      return new Ember.RSVP.Promise(function(resolve){
        Ember.run.later(resolve, result, delay);
      });
    }
  }
});
// END-SNIPPET
