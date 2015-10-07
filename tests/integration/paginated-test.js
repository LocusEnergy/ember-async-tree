import hbs from 'htmlbars-inline-precompile';
import range from 'lodash/utility/range';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('paginated', {
  integration: true
});

test('checkHasMore argument is used by hasMore', function(assert){
  const initialData = makeData(5);
  let checkHasMoreCalled;
  this.set('initialData', initialData);
  this.set('meta', {
    page: 1,
    pages: 5
  });
  this.on('fetch', function(){
    let result = makeData(5);
    result.meta = {
      page: 1,
      pages: 5
    };
    return result;
  });
  this.on('checkHasMore', function(){
    checkHasMoreCalled = true;
    return true;
  });
  this.render(hbs`
    {{#async-tree
      meta=meta
      children=initialData
      fetch=(action 'fetch')
      check-has-more=(action 'checkHasMore')
      as |node|
    }}{{node.name}}{{/async-tree}}
  `);
  assert.ok(checkHasMoreCalled, "checkHasMore was called");
});

function makeData() {
  return range(...arguments).map(function(index){
    return {
      name: `Item ${index+1}`
    };
  });
}
