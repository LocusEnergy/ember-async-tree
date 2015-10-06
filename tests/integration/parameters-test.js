import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('parameters', {
  integration: true
});

const { K } = Ember;

test('renders component with required parameters', function(assert) {
  this.on('open', K);
  this.on('close', K);
  this.render(hbs`{{async-tree close=(action 'close') open=(action 'open')}}`);

  var $component = this.$('.async-tree');
  assert.ok($component.hasClass('async-tree'));
});

test('initialData prepopulates the tree', function(assert){
  this.on('fetch', K);
  const initialData = [
    {title: 'Level 1'},
    {title: 'Level 2'},
    {title: 'Level 3'}
  ];
  this.set('initialData', initialData);
  this.render(hbs`
    {{#async-tree
      fetch=(action 'fetch')
      initialData=initialData
      as |node|
    }}{{node.title}}{{/async-tree}}`);
  assert.equal(this.$('.node-label').length, 3);
  assert.equal(this.$('.node-label:eq(0)').text().trim(), 'Level 1');
  assert.equal(this.$('.node-label:eq(1)').text().trim(), 'Level 2');
  assert.equal(this.$('.node-label:eq(2)').text().trim(), 'Level 3');

  this.set('initialData', [
    {title: 'Level 1 - after render'},
    {title: 'Level 2 - after render'}
  ]);
  assert.equal(this.$('.node-label').length, 2);
  assert.equal(this.$('.node-label:eq(0)').text().trim(), 'Level 1 - after render');
  assert.equal(this.$('.node-label:eq(1)').text().trim(), 'Level 2 - after render');
});

test('initialData works with children-filter', function(assert){
  this.set('fetch', ()=>{});
  this.set('checkOpen', ()=>{});
  const types = {
    country: 'state',
    state: 'city',
  };
  this.set('childrenFilter', function (data, parent) {
    const type = parent ? types[parent.type] : 'country';
    const parentName = parent ? parent.name : undefined;
    return data.filter(function(item){
      if (parentName) {
        return item.type === type && item.parent === parentName;
      } else {
        return item.type === type;
      }
    });
  });
  this.set('initialData', [
    {name: 'USA', type: 'country'},
    {name: 'California', type: 'state', parent: 'USA'},
    {name: 'New York', type: 'state', parent: 'USA'},
    {name: 'Alaska', type: 'state', parent: 'USA'},
    {name: 'San Francisco', type: 'city', parent: 'California'},
    {name: 'Los Angeles', type: 'city', parent: 'California'},
    {name: 'New York City', type: 'city', parent: 'New York'},
    {name: 'Juneau', type: 'city', parent: 'Alaska'}
  ]);
  this.render(hbs`
    {{#async-tree
      fetch=fetch
      checkOpen=checkOpen
      initialData=initialData
      children-filter=childrenFilter
      as |node|
    }}{{node.name}}{{/async-tree}}`);
  assert.equal(this.$('.node-label').length, 8);
  assert.equal(this.$('.node-list .node-label:eq(0)').text().trim(), 'USA');

  assert.equal(this.$('.node-list .node-list:eq(0) .node-label:eq(0)').text().trim(), 'California');
  assert.equal(this.$('.node-list .node-list:eq(0) .node-label:eq(1)').text().trim(), 'San Francisco');
  assert.equal(this.$('.node-list .node-list:eq(0) .node-label:eq(2)').text().trim(), 'Los Angeles');
});
