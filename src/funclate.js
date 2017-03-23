/**
 * The current root element, i.e. where the starting point of the updateElement function.
 * @type {HTMLElement}
 */
let rootElement = null;

/**
 * The current parent element of the processed instruction.
 * @type {HTMLElement}
 */
let parentElement = null;

/**
 * @typedef Context
 * @type {object}
 * @property {HTMLElement} r the root element
 * @property {HTMLElement} p the parent element
 */

/**
 * Build a context object.
 * @return {Context} the context
 */
function getCtx() {
    return {r: rootElement, p: parentElement};
}

/**
 * Restore a context object.
 * @param {Context} ctx the context to restore
 */
function restoreCtx(ctx) {
    rootElement = ctx.r;
    parentElement = ctx.p;
}

/**
 * Remove the un-visited nodes.
 */
function cleanRemainingNodes() {
    while (parentElement.childNodes.length > lastIndex()) {
        parentElement.removeChild(parentElement.lastChild);
    }
}

/**
 * Udpate the sub tree of the given root according to the given render function.
 * @param {!HTMLElement} root the root element
 * @param {!function(el: HTMLElement)} render the render function
 */
export function updateElement(root, render) {
    const ctx = getCtx();

    rootElement = root;
    parentElement = root;

    let lightFrag = null;
    if (!root.__visited__) {
        lightFrag = document.createDocumentFragment();
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
    return parentElement.fcIndex;
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
 * @param {Node} found which should be the current node
 * @return {Node} the handled node
 */
function handleNode(value, nodeType, factory, found) {
    const index = nextIndex();
    let current = parentElement.childNodes.item(index);
    if (found) {
        if (current) {
            current = parentElement.insertBefore(found, current);
        } else {
            current = parentElement.appendChild(factory(value));
        }
    } else if (current) {
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
 * @typedef ElementOptions
 * @type {object}
 * @property {boolean} content if true the element will be the entry of the light DOM structure
 * @property {boolean} voidElement if true the element cannot have children
 */

/**
 * Create an element
 * @param name the name
 * @param attrs the attributes
 * @return {Element} the element
 */
function createElement(name, attrs) {
    const is = attrs && attrs.is;
    return is ? document.createElement(name, is) : document.createElement(name);
}

/**
 * Handle a {Element}.
 * @param {string} name the name of the element
 * @param {Object.<string, string|number|boolean>} attrs the attributes of the element
 * @param {Object.<string, *>}  props the properties of the element
 * @param {ElementOptions} opts the options driving the creation of the element
 * @param {HtmlElement} found which should be the current element
 * @return {Element} the handled element
 */
function handleElement(name, attrs, props, opts, found) {
    const index = nextIndex();
    let current = parentElement.childNodes.item(index);

    if (found) {
        if (current) {
            current = parentElement.insertBefore(found, current);
        } else {
            current = parentElement.appendChild(found);
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

    if (attrs) {
        Object.keys(attrs).forEach(k => current.setAttribute(k, attrs[k]));
    }

    if (props) {
        Object.keys(props).forEach(k => current[k] = props[k]);
    }

    if (opts && opts.key) {
        current.dataset.fcKey = opts.key;
    }

    if (opts && opts.content) {
        rootElement.__content__ = current;
    }

    if (!(opts && opts.voidElement)) {
        parentElement = current;
    }

    return current;
}

/**
 * Open an element.
 * @param {string} name the name of the element
 * @param {Object.<string, string|number|boolean>} attrs the attributes of the element
 * @param {Object.<string, *>}  props the properties of the element
 * @param {ElementOptions} opts the options driving the creation of the element
 * @return {Element} the element
 */
export function fcOpenElement(name, attrs, props, opts) {
    return handleElement(name, attrs, props, opts);
}

/**
 * Close the current element.
 */
export function fcCloseElement() {
    cleanRemainingNodes();
    clearIndex();
    parentElement = parentElement.parentElement;
}

/**
 * Open and close a void element.
 * @param {string} name the name of the element
 * @param {Object.<string, string|number|boolean>} attrs the attributes of the element
 * @param {Object.<string, *>}  props the properties of the element
 * @param {ElementOptions} opts the options driving the creation of the element
 * @return {Element} the element
 */
export function fcOpenVoidElement(name, attrs, props, opts = {}) {
    opts.voidElement = true;
    return handleElement(name, attrs, props, opts);
}

/**
 * To add a <code>__content__</code> node.
 * This node will be used to locate the entry of the light DOM structure.
 */
export function fcContent() {
    rootElement.__content__ = handleElement('fc-content', null, null, {voidElement: true}, rootElement.__content__);
}

/**
 * To write a text node.
 * @param {string} text the text node's value
 * @return {Node} the text node
 */
export function fcText(text) {
    return handleNode(text, Node.TEXT_NODE, v => document.createTextNode(text));
}

/**
 * To write a comment node.
 * @param {string} text the comment node's value
 * @return {Node} the comment node
 */
export function fcComment(text) {
    return handleNode(text, Node.COMMENT_NODE, v => document.createComment(text));
}
