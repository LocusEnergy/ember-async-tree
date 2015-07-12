// BEGIN-SNIPPET simple-controller
import Ember from 'ember';

const { on, get } = Ember;

export default Ember.Controller.extend({
  openNodes: null,
  initialize: on('init', function(){
    this.set('openNodes', []);
  }),
  fetch: Ember.computed({
    get() {
      return (node)=>{
        let result;
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
        return new Ember.RSVP.Promise(function(resolve){
          Ember.run.later(resolve, result, 3000);
        });
      };
    }
  }),
  checkOpen: Ember.computed('openNodes.[]', {
    get() {
      let nodes = this.get('openNodes');
      return (node)=>{
        return nodes.contains(node);
      };
    }
  }),
  actions: {
    open(node) {
      this.get('openNodes').addObject(node);
    },
    close(node) {
      this.get('openNodes').removeObject(node);
    }
  }
});
// END-SNIPPET
