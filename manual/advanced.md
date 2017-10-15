# Advanced

## Methods

To open an element the method `openElement()` has to be called first
and then `closeElement()` has to be called to close the element.
Between both invocations all other invocations will be related to children, sub-children and so one.

`openVoidElement()` has to be used for element like 'input', 'br', 'hr' and so one.

`text()` has to be used to insert texts.

`comment()` has to be used to insert HTML comments.

## Shadow DOM and light DOM

The management of the pseudo shadow/light DOM is closed to the _transclude_ concept of AngularJs.
The idea is to perform the rendering many time without touching the sub DOM tree, 
i.e. the rendering operation update the shadow DOM like structure skipping the light DOM like structure.

### Using the `<content></content>` element like

Given the following rendering function, declaring a "content" node using `content()`.

```javascript
import {updateElement, text, content} from 'funclate';
updateElement(document.querySelector('#container'), () => {
    text('before');
    content();
    text('after');
});
```

When the following HTML snippet is parsed

```html
<div id="container">foo bar</div>
```

Then the following DOM node is built

```html
<div id="container">before<fc-content>foo bar</fc-content>after</div>
```

As you see, the light DOM `foo bar` is moved within the `<fc-content></fc-content>` node.

### Using the option `content`

Given the following rendering function, declaring a "content" node using the option `content`.

```javascript
import {updateElement, text, openElement, closeElement} from 'funclate';
updateElement(document.querySelector('#container'), () => {
    text('before');
    openElement('div', null, null, ['content', true]);
    closeElement();
    text('after');
});
```

When the following HTML snippet is parsed

```html
<div id="container">foo bar</div>
```

Then the following DOM node is built

```html
<div id="container">before<div>foo bar</div>after</div>
```

As you see, the light DOM `foo bar` is moved within the `<div></div>` node.

## Reuse matching element with `key`

When opening an element with `openElement()`, a `key` can be given as options.
This key will be used during the rendering process.
The idea is to discover and move an existing element having the same key.
By this way the creating or recycling steps can be skipped. 

```javascript
import {updateElement, text, openElement, closeElement} from 'funclate';
updateElement(document.querySelector('#container'), () => {
    ['item1', 'item2', 'item3'].forEach(item => {
        openElement('div', null, null, ['key', item]);
        text(item);
        closeElement();
    });
});
```
