import hbs from 'htmlbars-inline-precompile';
import range from 'lodash/utility/range';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('paginated', {
  integration: true
});

test('checkHasMore argument is used by hasMore', function(assert){
  const initialData = makeData(5);
  const [ firstNode ] = initialData;
  let checkHasMoreCallCount = 0;
  this.set('initialData', initialData);
  this.set('meta', {
    page: 1,
    pages: 5
  });
  this.set('checkOpen', function(node){
    return node === firstNode;
  });
  this.set('fetch', function(){
    let result = makeData(5);
    result.meta = {
      page: 1,
      pages: 5
    };
    return result;
  });
  this.set('checkHasMore', function(node){
    if (node) {
      checkHasMoreCallCount++;
    }
    return node === firstNode;
  });
  this.render(hbs`
    {{#async-tree
      children=initialData
      meta=meta
      fetch=fetch
      checkOpen=checkOpen
      checkHasMore=checkHasMore
      as |node|
    }}{{node.name}}{{/async-tree}}
  `);
  assert.equal(checkHasMoreCallCount, 2, "checkHasMore called twice");
});

function makeData() {
  return range(...arguments).map(function(index){
    return {
      name: `Item ${index+1}`
    };
  });
}
