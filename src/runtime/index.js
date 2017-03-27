import {findNodeFromKey, fromArrayToObject, sanitize, updateAttributes, updateProperties} from './utils';

/**
 * The current root element, i.e. where the starting point of the updateElement function.
 * @type {Element}
 */
let rootElement = null;

/**
 * The current document owning the current root element
 * @type {Document}
 */
let rootDocument = null;

/**
 * The current parent element of the processed instruction.
 * @type {Element}
 */
let parentElement = null;

/**
 * @typedef {object} Context
 * @property {Element} root the root element
 * @property {Element} parent the parent element
 * @property {Document} document the document owning the root element
 * @private
 */

/**
 * @typedef {object} ElementOptions
 * @property {boolean} content if true the element will be the entry of the light DOM structure
 * @property {string} key the element's key
 * @property {boolean} skipChildren if true the children's element won't be parsed
 * @property {Node} found will be used as current node
 * @private
 */

/**
 * Build a context object.
 * @return {Context} the context
 */
function getCtx() {
    return {root: rootElement, parent: parentElement, document: rootDocument};
}

/**
 * Restore a context object.
 * @param {!Context} ctx the context to restore
 */
function restoreCtx(ctx) {
    rootElement = ctx.root;
    parentElement = ctx.parent;
    rootDocument = ctx.document;
}

/**
 * Remove the un-visited nodes.
 */
function cleanRemainingNodes() {
    if (rootElement.__content__ !== parentElement) {
        while (parentElement.childNodes.length > lastIndex()) {
            parentElement.removeChild(parentElement.lastChild);
        }
    }
}

/**
 * Get and increment the fcIndex property of the current parent.
 * @return {number} the index
 */
function nextIndex() {
    if (!parentElement.fcIndex) {
        parentElement.fcIndex = 0;
    }
    let index = parentElement.fcIndex;
    parentElement.fcIndex = parentElement.fcIndex + 1;
    return index;
}

/**
 * Get fcIndex property of the current parent.
 * @return {number} the index
 */
function lastIndex() {
    return parentElement.fcIndex || 0;
}

/**
 * Clear the fcIndex property of the current parent.
 */
function clearIndex() {
    delete parentElement.fcIndex;
}

/**
 * Handle a Node.
 * @param {!string} value the node's value
 * @param {!number} nodeType the node's type
 * @param {!function(value: string): Node} factory the factory creating the node when necessary
 * @return {Node} the handled node
 */
function handleNode(value, nodeType, factory) {
    const index = nextIndex();
    let current = parentElement.childNodes.item(index);

    if (current) {
        if (current.nodeType !== nodeType) {
            parentElement.insertBefore(factory(value), current);
        } else {
            current.nodeValue = value;
        }
    } else {
        parentElement.appendChild(factory(value));
    }

    return current;
}

/**
 * Create an element
 * @param {!string} name the name
 * @param {Object.<string, string|number|boolean>} attrs the attributes
 * @return {Element} the element
 */
function createElement(name, attrs) {
    let index = attrs ? attrs.indexOf('is') : -1;
    return index > -1 ? rootDocument.createElement(name, attrs[index + 1]) : rootDocument.createElement(name);
}

/**
 * Handle a {Element}.
 * @param {!string} name the name of the element
 * @param {Array} [attrs] the attributes of the element
 * @param {Array}  [props] the properties of the element
 * @param {ElementOptions} [opts] the options driving the creation of the element
 * @return {Element} the handled element
 */
function handleElement(name, attrs, props, opts) {
    const index = nextIndex();
    let current = parentElement.childNodes.item(index);

    let found = opts.found ? opts.found : null;
    if (!found && opts.key) {
        found = findNodeFromKey(parentElement, lastIndex(), opts.key);
    }

    if (found) {
        if (current !== found) {
            current = parentElement.insertBefore(found, current);
        }
    } else if (current) {
        if (name.toLowerCase() !== (current.tagName || '').toLowerCase()) {
            current = parentElement.insertBefore(
                createElement(name, attrs),
                current
            );
        }
    } else {
        current = parentElement.appendChild(
            createElement(name, attrs)
        );
    }

    updateAttributes(current, attrs);
    updateProperties(current, props);

    if (opts.key) {
        current.dataset.fcKey = opts.key;
    }

    if (opts.content) {
        rootElement.__content__ = current;
    }

    if (!opts.skipChildren) {
        parentElement = current;
    }

    return current;
}

/**
 * List all methods.
 * This object should be used as argument of factories of render functions.
 * @type {{closeElement: closeElement, openElement: openElement, comment: comment, content: content, text: text, voidElement: voidElement}}
 */
const METHODS = {closeElement, openElement, comment, content, text, voidElement};

/**
 * Update the sub tree of the given root according to a given factory of the render function.
 * @param {!HTMLElement} root the root element
 * @param {!function(fc: object)} factory the render function
 * @return {function(el: HTMLElement)}  the render function
 */
export function createThenUpdate(root, factory) {
    const render = factory(METHODS);
    updateElement(root, factory(METHODS));
    return render;
}

/**
 * Update the sub tree of the given root according to the given render function.
 * @param {!HTMLElement} root the root element
 * @param {!function(el: HTMLElement)} render the render function
 */
export function updateElement(root, render) {
    const ctx = getCtx();

    rootElement = root;
    rootDocument = root.ownerDocument;
    parentElement = root;

    let lightFrag = null;
    if (!root.__visited__) {
        lightFrag = rootDocument.createDocumentFragment();
        while (root.childNodes.length > 0) {
            lightFrag.appendChild(root.removeChild(root.firstChild));
        }
    }

    render(root);

    cleanRemainingNodes();
    clearIndex();

    root.__visited__ = true;
    if (lightFrag && root.__content__) {
        root.__content__.appendChild(lightFrag);
    }

    restoreCtx(ctx);
}

/**
 * Open an element.
 *
 * @example <caption>set attributes</caption>
 * openElement('p', ['id', 'my-p' ,'class', classValue]);
 * closeElement();
 *
 * @example <caption>set properties</caption>
 * const selectValue = 'foo';
 * openElement('select', null, ['value', selectValue])
 * closeElement();
 *
 * @example <caption>set the element has a light DOM content</caption>
 * openElement('div', null, null, ['content', true])
 * closeElement();
 *
 * @example <caption>set the element's key</caption>
 * openElement('li', null, null, ['key', 'my-li'])
 * closeElement();
 *
 * @param {!string} name the name of the element
 * @param {Array.<undefined|null|string|number|boolean>} [attrs] the attributes of the element
 * @param {Array} [props] the properties of the element
 * @param {Array} [opts] the options driving the creation of the element, c.f. {@link ElementOptions}
 * @return {Element} the element
 */
export function openElement(name, attrs, props, opts) {
    return handleElement(
        name,
        attrs,
        props,
        fromArrayToObject(opts)
    );
}

/**
 * Close the current element.
 */
export function closeElement() {
    cleanRemainingNodes();
    clearIndex();
    parentElement = parentElement.parentElement;
}

/**
 * Open and close a void element.
 * @param {!string} name the name of the element
 * @param {Array.<undefined|null|string|number|boolean>} [attrs] the attributes of the element
 * @param {Array} [props] the properties of the element
 * @param {Array} [opts] the options driving the creation of the element, c.f. {@link ElementOptions}
 * @return {Element} the element
 */
export function voidElement(name, attrs, props, opts) {
    return handleElement(
        name,
        attrs,
        props,
        fromArrayToObject(['skipChildren', true].concat(opts))
    );
}

/**
 * To add a <code><fc-content></fc-content></code> node.
 * This node will be used to locate the entry of the light DOM structure.
 */
export function content() {
    rootElement.__content__ = handleElement('fc-content', null, null, {
        skipChildren: true,
        found: rootElement.__content__
    });
}

/**
 * Create a text node.
 * @param {string} [value] the node value
 * @returns {Text}
 */
function textNodeFactory(value) {
    return rootDocument.createTextNode(sanitize(value));
}

/**
 * Create a text node.
 * @param {string} [value] the node value
 * @returns {Comment}
 */
function commentFactory(value) {
    return rootDocument.createComment(sanitize(value));
}

/**
 * To write a text node.
 * @param {string} [text] the text
 * @return {Node} the text node
 */
export function text(text) {
    return handleNode(text, rootElement.TEXT_NODE, textNodeFactory);
}

/**
 * To write a comment node.
 * @param {string} [text] the comment
 * @return {Node} the comment node
 */
export function comment(text) {
    return handleNode(text, rootElement.COMMENT_NODE, commentFactory);
}
