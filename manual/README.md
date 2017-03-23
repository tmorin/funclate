# funclate

A templating engine patching the DOM incrementally like [incremental-dom](https://google.github.io/incremental-dom/) but with Custom Element in mind.

That means, even if the philosophy of both templating system are closed,
`funclate()` focused on custom element managing pseudo light/shadow DOM trees.
Moreover, the creation of element like `<button is="my-button"></button>` is obviously shipped.

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
