import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['load-more'],
  didInsertElement() {
    Ember.run.scheduleOnce('afterRender', this, 'sendAction', 'on-render');
  }
});
