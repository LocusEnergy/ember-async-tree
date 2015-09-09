import Ember from 'ember';

export default Ember.Mixin.create({
  _fetch(node) {
    const fetch = this.get('fetch');
    this.set('isLoading', true);
    let promise = fetch(node)
      .then((nodes)=>{
        this.set('nodes', nodes);
        return nodes;
      })
      .finally(()=>{
        this.set('isLoading', false);
      });
    this.set('promise', promise);
    return promise;
  }
});
