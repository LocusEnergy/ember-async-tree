export const FIRST_PARENT = { name: 'first parent', type: 'parent' };
export const SECOND_PARENT = { name: 'second parent', type: 'parent' };
export const THIRD_PARENT = { name: 'third parent', type: 'parent' };
export const FIRST_CHILD = { name: 'first child', type: 'child' };
export const SECOND_CHILD = { name: 'second child', type: 'child' };
export const THIRD_CHILD = { name: 'third child', type: 'child' };
export const FIRST_GRANDCHILD = { name: 'first grandchild', type: 'grandchild'};
export const SECOND_GRANDCHILD = { name: 'second grandchild', type: 'grandchild'};
export const THIRD_GRANDCHILD = { name: 'third grandchild', type: 'grandchild'};

export function FILTER(initial, item = {}){
  let children = {
    "undefined": "parent",
    "parent": "child",
    "child": "grandchild"
  };
  let {type} = item;
  return initial.filter(function(item){
    return item.type === `${children[type]}`;
  });
}
