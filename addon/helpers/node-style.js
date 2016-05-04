import Ember from 'ember';

export default function nodeStyleHelper([callback, node], {bind}){
  let style = callback.call(bind, node);
  return Ember.String.htmlSafe(style);
}
