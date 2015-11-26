import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Mixin.create({
  isNotLoaded: computed.none('_children'),
  isLoaded: computed.not('isNotLoaded'),

  startLoading() {
    this.set('isLoading', true);
  },

  finishLoading() {
    this.set('isLoading', false);
  }
});
