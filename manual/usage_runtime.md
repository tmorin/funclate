# Runtime

At runtime, DOM can be patched using two functions.

The first one will patch an element according to a render function.

```javacript
updateElement(element: HTMLElement, render: function(element: HTMLElement))
```

The second one will patch an element according to the factory of a render function.
In deed, the render function is created then `updateElement()` with it to patch the DOM.
Moreover, the created render function is returned.
By this way, when needed `updateElement()` can be directly used.

```javacript
createThenUpdate(element: HTMLElement, factory: function(fc: object)) : function(element: HTMLElement)
```

## From a crafted render function

```javascript
import {updateElement, openElement, closeElement, text} from 'funclate';
updateElement(document.querySelector('#container'), el => {
    // open a tag button
    openElement('button');
    // add a text node inside the button,
    // the value of the text node is the value of the attribute label
    text(el.getAttribute('label'));
    // close the tag button
    closeElement();    
});
```

## From a factory

```javascript
import {createThenUpdate, updateElement} from 'funclate';
// use one of the shipped plugins to get the factory 
import factory from './my-template.fc';

// build the render function then patch the container 
const render = createThenUpdate(document.querySelector('#container'), factory);

// when needed, the container can be patched calling directly `updateElement()`
updateElement(document.querySelector('#container'), render);
```

Obviously `createThenUpdate()` can be skipped:
```javascript
import * as funclate from 'funclate';
// use one of the shipped plugins to get the factory 
import factory from './my-template.fc';

// build the render function then patch the container 
const render = factory(funclate);

// when needed, the container can be patched calling directly `updateElement()`
funclate.updateElement(document.querySelector('#container'), render);
```
