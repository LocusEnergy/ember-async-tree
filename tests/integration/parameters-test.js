import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('parameters', {
  integration: true
});

test('not providing required parameters throws an error', function(assert){
  assert.throws(function(){
    this.render(hbs`{{async-tree}}`);
  }, 'openCheck is required');

  this.set('openCheck', ()=>{});
  assert.throws(function() {
    this.render(hbs`{{async-tree openCheck=openCheck}}`);
  }, 'fetch is required');
});

test('renders component with required parameters', function(assert) {
  this.set('fetch', ()=>{});
  this.set('checkOpen', ()=>{});
  this.render(hbs`{{async-tree fetch=fetch checkOpen=checkOpen}}`);

  var $component = this.$('.async-tree');
  assert.ok($component.hasClass('async-tree'));
});

test('fetch-on-init=true calls fetch when component initializes', function(assert){
  let called = false;
  this.set('fetch', ()=>{
    called = true;
    return Ember.RSVP.resolve();
  });
  this.set('checkOpen', ()=>{});
  this.render(hbs`{{async-tree fetch-on-init=true fetch=fetch checkOpen=checkOpen}}`);
  assert.ok(called, "Fetch was called.");
});

test('children fetch on init', function(assert){
  let content = [
    {title: 'First child'},
    {title: 'Second child'}
  ];
  this.set('fetch', (node)=>{
    let children = [];
    if (node == null) {
      children = content;
    }
    return Ember.RSVP.resolve(Ember.A(children));
  });
  this.set('checkOpen', ()=>{
    return false;
  });
  this.render(hbs`
    {{#async-tree
      fetch-on-init=true
      fetch=fetch
      checkOpen=checkOpen
      as |node|
    }}{{node.title}}{{/async-tree}}`);
  var $component = this.$('.async-tree');
  assert.equal($component.find('.async-tree-node').length, 2, "two children are shown");
  assert.ok($component.hasClass('is-open'));
  assert.ok($component.find(':contains(First child)'));
  assert.ok($component.find(':contains(Second child)'));
});

test('fetch-on-init=true sets children', function(assert){
  let called = false;
  this.set('fetch', ()=>{
    called = true;
    return Ember.RSVP.resolve();
  });
  this.set('checkOpen', ()=>{});
  this.render(hbs`{{async-tree fetch-on-init=true fetch=fetch checkOpen=checkOpen}}`);
  assert.ok(called, "Fetch was called.");
});
