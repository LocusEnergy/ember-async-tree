import Ember from 'ember';

export function nodeStyle([callback, node], {bind}){
  let style = callback.call(bind, node);
  return Ember.String.htmlSafe(style);
}


export default Ember.Helper.helper(nodeStyle);
