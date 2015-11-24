// BEGIN-SNIPPET paginated-controller
import Ember from 'ember';
import range from 'lodash/utility/range';

const {
  on,
  A
} = Ember;

export default Ember.Controller.extend({
  openNodes: null,
  initialize: on('init', function(){
    this.set('openNodes', new A([]));
  }),
  actions: {
    open(node) {
      this.get('openNodes').addObject(node);
    },
    close(node) {
      this.get('openNodes').removeObject(node);
    },
    fetch(node, meta){
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
    },
    checkHasMore(node, meta){
      const isLoadingMore = !!meta;
      if (!isLoadingMore) {
        return;
      }
      const page = meta.page;
      const nextPage = page + 1;
      const maxPage = meta.pages;
      return nextPage <= maxPage;
    }
  }
});
// END-SNIPPET
