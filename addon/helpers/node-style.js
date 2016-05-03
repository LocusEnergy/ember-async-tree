import Ember from 'ember';

export default function nodeStyleHelper([callback, node, isEnabled], {bind}){
  if (isEnabled) {
    let style = callback.call(bind, node);
    return Ember.String.htmlSafe(style);
  } else {
    return '';
  }
}
