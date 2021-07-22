# funclate

[![npm version](https://badge.fury.io/js/%40tmorin%2Ffunclate.svg)](https://badge.fury.io/js/%40tmorin%2Ffunclate)
[![Continous Integration - Build](https://github.com/tmorin/funclate/actions/workflows/ci-build.yaml/badge.svg)](https://github.com/tmorin/funclate/actions/workflows/ci-build.yaml)
[![api](https://img.shields.io/badge/-api-informational.svg)](https://tmorin.github.io/funclate)

> A library, embracing Custom Element concerns, to update DOM nodes with simple template literal statements. 

The library leverages on the [Template literals] type to transform HTML statements to in template instances.
The [Custom Elements (v1)] concerns is also covered, for instance the handling of the `is` attribute.

## Simple Greeting

The following Typescript snippet :

```typescript
import {funclate} from "funclate"

function createSimpleGreeting(name = "world") {
  return funclate`<p>Hello, <strong>${name}</strong>!</p>`
}

createSimpleGreeting("John Doe").render(document.body)
```

Renders the following HTML statement :

```html
<p>
  Hello, <strong>John Doe</strong>!
</p>
```

## Install

From the npm registry

```bash
npm install @tmorin/funclate
```

Directly in the browser

```html
<script src="https://unpkg.com/@tmorin/funclate/dist/funclate.min.js"></script>
```

## License

Released under the [MIT license].

[Template literals]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
[Custom Elements (v1)]: https://html.spec.whatwg.org/multipage/custom-elements.html
[MIT license]: http://opensource.org/licenses/MIT
