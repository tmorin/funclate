# Installation

`funclate` is available from [npm](https://www.npmjs.com/package/funclate) and [bower](http://bower.io/search/?q=funclate).

From npm:
```bash
npm install funclate
```

From bower:
```bash
bower install funclate
```

`funclate` can also be fetched from a [unpkg](https://unpkg.com), a CDN:

```html
<script src="https://unpkg.com/funclate/dist/funclate.js"></script>
```

```html
<script src="https://unpkg.com/funclate/dist/funclate.min.js"></script>
```

## babel

A babel's plugin is available to compile an funclate template into a render factory.

See [plugins](http://babeljs.io/docs/advanced/plugins) to get more information about plugins in babel.

```javascript
{
    plugins: ['funclate/lib/integration/babel']
}
```

Presently the plugin only support ES6 templates tagged with `funclate`.

For instance,
```javascript
let template = funclate`<p class="foo {{el.bar}}">Hello</p>`;
```
will be compiled into:
```javascript
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
```
Be aware the template can not contain expressions like ``${foo}``.

## Webpack

A webpack's loader is available to compile an funclate file into a render factory.

See [module.loaders](http://webpack.github.io/docs/configuration.html#module-loaders) to get more information about loaders in webpack.

```
module.loaders: [
    {test: /\.fc$/, loader: 'funclate/lib/integration/webpack'}
];
```

## Browserify

A browserify's transform module is available to compile an funclate file into a render factory.

See [transforms](https://github.com/substack/browserify-handbook#transforms) to get more information about the transform system in browserify.

```shell
browserify -t funclate/lib/plugins/browserify main.js > bundle.js
```

```javascript
var browserify = require('browserify');
var idomizerify = require('funclate/lib/plugins/browserify');
var bundle = browserify();
bundle.transform({ extension: 'html' }, idomizerify);
```
