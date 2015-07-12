import Ember from 'ember';

export default function mustImplement() {
  return Ember.computed({
    get(keyName) {
      throw new Ember.Error(`${keyName} is required`);
    }
  });
}
