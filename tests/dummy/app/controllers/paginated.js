// BEGIN-SNIPPET paginated-controller
import Ember from 'ember';
import range from 'lodash/utility/range';

const {
  on
} = Ember;

export default Ember.Controller.extend({
  openNodes: null,
  initialize: on('init', function(){
    this.set('openNodes', []);
  }),
  fetch: Ember.computed({
    get() {
      return (node, meta)=>{
        let isLoadingMore = !!meta;
        let page, offset;
        if (isLoadingMore) {
          page = meta.page + 1;
          offset = meta.page * 10;
        } else {
          offset = 0;
          page = 1;
        }
        let results = range(10).map(function(index){
          return {
            name: `Item ${offset + index} (page: ${page}, from: controller)`
          };
        });
        results.meta = {
          page: page,
          pages: 10
        };
        return results;
      };
    }
  }),
  checkHasMore: Ember.computed({
    get() {
      return (node, meta) => {
        const isLoadingMore = !!meta;
        if (!isLoadingMore) {
          return;
        }
        const page = meta.page;
        const nextPage = page + 1;
        const maxPage = meta.pages;
        return nextPage <= maxPage;
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
