# Usage

The main function is :

```updateElement(element: HTMLElement, render: function(element: HTMLElement))```

The template (i.e. the render function) has to be given as a `function`.

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

## Methods

To open an element the method `openElement()` has to be called first
and then `closeElement()` has to be called to close the element.
Between both invocations all other invocations will be related to children, sub-children and so one.

`fcOpenVoidElement()` has to be used for element like 'input', 'br', 'hr' and so one.

`text()` has to be used to insert texts.

`fcComment()` has to be used to insert HTML comments.

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
    openElement('div', null, null, {content: true});
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