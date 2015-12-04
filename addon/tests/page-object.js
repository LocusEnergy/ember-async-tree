import Ember from 'ember';

export default class AsyncTreePageObject {
  constructor(env) {
    this.env = env;
  }

  component() {
    return this.env.$('.async-tree');
  }

  itemText(index) {
    let items = sortItemsByPosition(this.env, true);
    return Ember.$(items[index]).text().trim();
  }

  itemContains(text) {
    let items = sortItemsByPosition(this.env, true);
    return items.find(`.node-list-item:contains('${text}')`);
  }
}

function findItems(context) {
  return context.$('.ember-collection > div:first > div:first > div');  // scrollable's content's children (cells)
}

function findVisibleItems(context) {
  return context.$('.ember-collection > div:first > div:first > div:visible');
}

function extractPosition(element) {
  return element.getBoundingClientRect();
}

function sortItemsByPosition(view, visibleOnly) {
  var find = visibleOnly ? findVisibleItems : findItems;
  var items = find(view);
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
