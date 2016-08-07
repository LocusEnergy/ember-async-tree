import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

export default Ember.Component.extend(InViewportMixin, {
  classNames: ['load-more'],
  init() {
    this._super(...arguments);
    const scrollSelector = this.get('scroll-selector');
    if (scrollSelector) {
      this.set('viewportListeners', [
        { context: scrollSelector, event: 'scroll.scrollable' },
        { context: scrollSelector, event: 'resize.resizable' },
        { context: scrollSelector, event: 'touchmove.scrollable' }
      ]);
    }
    this.set('viewportSpy', true);
  },
  didEnterViewport() {
    this.sendAction('on-enter-viewport');
  }
});
