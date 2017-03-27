# Overview

funclate has been highly inspired by [incremental-dom](http://google.github.io/incremental-dom).
However, even if both libraries are sharing the same philosophy, DOM patching,
funclate has been designed with custom element in mind.

## build time / run time

funclate is shipped with an HTML parser designed to be used at build time.
And with a template engine designed to execute render functions at run time.

A compiled template is a JavaScript function designed to create a render function.
In other words, a compiled template is the factory of a render function.
The render function contains the rendering logic expressed within the HTML template.

## Shadow/Light DOM

When playing with custom elements, one of the most challenging part is the management of a pseudo Shadow DOM.
Pseudo, because according to [caniuse.com], the Shadow DOM feature is not yet implemented by most of the browsers.

For funclate, by default the patched element is te entry point of a Shadow DOM tree.
That means all descendants of the patched element will be visited during the patching process.
However, this Shadow DOM tree can have exit point, i.e. an Element.
Where its descendants will not be visited during the patching process.

In other hand, the behavior is closed to the _transclude_ concept of AngularJs.

[caniuse.com]: http://caniuse.com/#search=Shadow%20DOM

## Custom Element extended native one

The creation of element like `<button is="my-button"></button>` is obviously shipped.
