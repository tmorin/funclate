# funclate

[![Circle CI](https://circleci.com/gh/tmorin/funclate/tree/master.svg?style=svg)](https://circleci.com/gh/tmorin/funclate/tree/master)
[![Dependency Status](https://david-dm.org/tmorin/funclate.svg)](https://david-dm.org/tmorin/funclate)
[![devDependency Status](https://david-dm.org/tmorin/funclate/dev-status.svg)](https://david-dm.org/tmorin/funclate?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/tmorin/funclate/badge.svg?branch=master)](https://coveralls.io/github/tmorin/funclate?branch=master)
<img data-ice="coverageBadge" src="http://tmorin.github.io/funclate/badge.svg">

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

Learn more browsing [the manual](http://tmorin.github.io/funclate)!

## License

Released under the [MIT license](http://opensource.org/licenses/MIT).
