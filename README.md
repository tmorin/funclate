# funclate

[![Circle CI](https://circleci.com/gh/tmorin/funclate/tree/master.svg?style=svg)](https://circleci.com/gh/tmorin/funclate/tree/master)
[![Dependency Status](https://david-dm.org/tmorin/funclate.svg)](https://david-dm.org/tmorin/funclate)
[![devDependency Status](https://david-dm.org/tmorin/funclate/dev-status.svg)](https://david-dm.org/tmorin/funclate#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/github/tmorin/funclate/badge.svg?branch=master)](https://coveralls.io/github/tmorin/funclate?branch=master)
<img data-ice="coverageBadge" src="http://tmorin.github.io/funclate/badge.svg">

A templating engine like [incremental-dom](https://google.github.io/incremental-dom/) but for Custom Element.
However, even if the philosophy of both templating system are closed, `funclate()` focused on custom element managing pseudo light/shadow DOM trees.
Moreover, the creation of element like `<button is="my-button"></button>` is obviously shipped.

## Integration

funclate is available from [npm](https://www.npmjs.com/package/funclate) and [bower](http://bower.io/search/?q=funclate).

From npm:
```bash
npm install funclate
```

From bower:
```bash
bower install funclate
```

funclate can also be fetched from a [unpkg](https://unpkg.com), a CDN:

```html
<script src="https://unpkg.com/ceb/dist/funclate.js"></script>
```

```html
<script src="https://unpkg.com/ceb/dist/funclate.min.js"></script>
```

## Documentation

The main function is :

```updateElement(element: HTMLElement, render: function(element: HTMLElement))```

The template (i.e. the render function) has to be given as a `function`.

```javascript
import {updateElement, fcOpenElement, fcCloseElement, fcText} from 'ceb';
updateElement(document.querySelector('#container'), el => {
    // open a tag button
    fcOpenElement('button');
    // add a text node inside the button,
    // the value of the text node is the value of the attribute label
    fcText(el.getAttribute('label'));
    // close the tag button
    fcCloseElement();    
});
```

## Methods

To open an element the method `fcOpenElement()` has to be called first
and then `fcCloseElement()` has to be called to close the element.
Between both invocations all other invocations will be related to children, sub-children and so one.

`fcOpenVoidElement()` has to be used for element like 'input', 'br', 'hr' and so one.

`fcText()` has to be used to insert texts.

`fcComment()` has to be used to insert HTML comments.

## Shadow DOM and light DOM

The management of the pseudo shadow/light DOM is closed to the _transclude_ concept of AngularJs.
The idea is to render many time without touching part of the sub DOM tree, 
i.e. the rendering operation update the shadow DOM like structure skipping the light DOM like structure.

### Using the `<content></content>` element like

Given the following custom element, declaring a "content" node using `fcContent()`.

```javascript
import {updateElement, fcText, fcContent} from 'ceb';
updateElement(document.querySelector('#container'), () => {
    fcText('before');
    fcContent();
    fcText('after');
});
```

When the following HTML snippet is parsed

```html
<ceb-content-with-element>foo bar</ceb-content-with-element>
```

Then the following DOM node is built

```html
<ceb-content-with-element>before<ceb-content>foo bar</ceb-content>after</ceb-content-with-element>
```

As you see, the light DOM `foo bar` is moved within the `<ceb-content></ceb-content>` node.

### Using the option `ceb-content`

Given the following custom element, declaring a "content" node using the option `content`.

```javascript
import {updateElement, fcText, fcOpenElement, fcCloseElement} from 'ceb';
updateElement(document.querySelector('#container'), () => {
    fcText('before');
    fcOpenElement('div', null, null, {content: true});
    fcCloseElement();
    fcText('after');
});
```

When the following HTML snippet is parsed

```html
<ceb-content-with-attribute>foo bar</ceb-content-with-attribute>
```

Then the following DOM node is built

```html
<ceb-content-with-attribute>before<div>foo bar</div>after</ceb-content-with-attribute>
```

As you see, the light DOM `foo bar` is moved within the `<div></div>` node.

## License

Released under the [MIT license](http://opensource.org/licenses/MIT).
