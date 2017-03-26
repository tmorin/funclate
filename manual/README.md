# funclate

> **fun**ction + temp**late** = **funclate**

A __build time__ HTML parser + a __runtime__ template engine to patch the DOM incrementally.

funclate has been designed with custom element in mind managing pseudo light/shadow DOM trees.
Moreover, the creation of element like `<button is="my-button"></button>` is obviously shipped.

So, for instance the following es6 snippet:
```javascript
import * as fc from 'funclate';

const body = document.body.querySelector('body');

let template = funclate`<p class="foo {{el.bar}}">Hello</p>`;

fc.updateElement(body, template(fc));
```

Will be compiled at build time to:
```javascript
import * as fc from 'funclate';

const body = document.body.querySelector('body');

var template = function (funclate) {
    var fcOpenElement = funclate.openElement;
    var fcCloseElement = funclate.closeElement;
    var fcVoidElement = funclate.voidElement;
    var fcContent = funclate.content;
    var fcText = funclate.text;
    var fcComment = funclate.comment;
    return function (__el__) {
        var el = __el__;
        fcOpenElement('p', ['class', 'foo ' + (el.bar === undefined || el.bar === null ? '' : el.bar)], [], undefined);
        fcText('Hello');
        fcCloseElement();
    };
};

fc.updateElement(body, template(fc));
```
