# funclate

[![Circle CI](https://circleci.com/gh/tmorin/funclate/tree/master.svg?style=svg)](https://circleci.com/gh/tmorin/funclate/tree/master)
[![Dependency Status](https://david-dm.org/tmorin/funclate.svg)](https://david-dm.org/tmorin/funclate)
[![devDependency Status](https://david-dm.org/tmorin/funclate/dev-status.svg)](https://david-dm.org/tmorin/funclate?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/tmorin/funclate/badge.svg?branch=master)](https://coveralls.io/github/tmorin/funclate?branch=master)
<img data-ice="coverageBadge" src="http://tmorin.github.io/funclate/badge.svg">

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

Learn more browsing [the manual](http://tmorin.github.io/funclate)!

## License

Released under the [MIT license](http://opensource.org/licenses/MIT).
