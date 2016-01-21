import Ember from 'ember';
import indexOf from 'lodash/array/findIndex';
import ResizeService from 'ember-resize/services/resize';

export default class AsyncTreePageObject {
  constructor(env, isIntegrationTest) {
    this.env = env;
    if (isIntegrationTest) {
      this.setupResizeService(this.env);
    }
  }

  setupResizeService(test) {
    test.register('service:resizeService', ResizeService);
    test.registry.injection('component', 'resizeService', 'service:resizeService');
  }

  component() {
    return this.env.$('.async-tree');
  }

  itemText(index) {
    let items = sortItemsByPosition(this.env, true);
    return Ember.$(items[index]).text().trim();
  }

  itemsText(selector = '.node-label') {
    let results = this.find(selector).toArray();
    return results.map(function(item){
      return Ember.$(item).text().trim();
    });
  }

  itemContains(text) {
    let items = sortItemsByPosition(this.env, true);
    return items.find(`.node-list-item:contains('${text}')`);
  }

  find(selector) {
    let component = this.component();
    return component.find(...arguments);
  }

  findIndex(selector, predicate) {
    let results = this.find(selector).toArray();
    return indexOf(results, predicate);
  }

  isOpenItem(name) {
    return this.env.$(`.is-open .node-label:contains(${name})`).length > 0;
  }

  isNotOpenItem(name) {
    return this.env.$(`.is-not-open .node-label:contains(${name})`).length > 0;
  }

  isEmpty() {
    return this.env.$('.node-list').hasClass('is-empty');
  }

  emptyText() {
    return this.env.$('.empty-message').text().trim();
  }
}

function findItems(context, selector) {
  return context.$(`div:first > div:first > div ${selector}`);  // scrollable's content's children (cells)
}

function findVisibleItems(context, selector) {
  return context.$(`div:first > div:first > div:visible ${selector}`);
}

function extractPosition(element) {
  return element.getBoundingClientRect();
}

function sortItemsByPosition(view, visibleOnly, selector) {
  var find = visibleOnly ? findVisibleItems : findItems;
  var items = find(view, selector);
  return sortElementsByPosition(items);
}

function sortElementsByPosition (elements) {
  return elements.sort(function(a, b){
    return sortByPosition(extractPosition(a), extractPosition(b));
  });
}

function sortByPosition(a, b) {
  if (b.top === a.top){
    return (a.left - b.left);
  }
  return (a.top - b.top);
}
