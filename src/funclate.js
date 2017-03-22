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
 * Try to find a light DOM node
 * @param {!HTMLElement} el the custom element
 * @returns {HTMLElement} the light DOM node if found otherwise it's the given HTML Element
 */
function findContentNode(el) {
    let element = el.cebContentNode ? el.cebContentNode : el;
    if (element === el) {
        return el;
    }
    return findContentNode(element);
}

/**
 * Remove and return the children of the light DOM node.
 * @param {!HTMLElement} el the custom element
 * @returns {DocumentFragment} the light DOM fragment
 */
function cleanOldContentNode(el) {
    let oldContentNode = el.lightDOM, lightFrag = document.createDocumentFragment();
    while (oldContentNode.childNodes.length > 0) {
        lightFrag.appendChild(oldContentNode.removeChild(oldContentNode.childNodes[0]));
    }
    return lightFrag;
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
    if (!root.cebContentNode) {
        lightFrag = cleanOldContentNode(root);
    }
    render(root);
    clearIndex();
    if (lightFrag && root.cebContentNode) {
        root.cebContentNode.appendChild(lightFrag);
    }
    restoreCtx(ctx);
}

/**
 * Get and increment the cebIndex property of the current parent.
 * @return {number} the index
 */
function nextIndex() {
    if (!parentElement.cebIndex) {
        parentElement.cebIndex = 0;
    }
    let index = parentElement.cebIndex;
    parentElement.cebIndex = parentElement.cebIndex + 1;
    return index;
}

/**
 * Get cebIndex property of the current parent.
 * @return {number} the index
 */
function lastIndex() {
    return parentElement.cebIndex;
}

/**
 * Clear the cebIndex property of the current parent.
 */
function clearIndex() {
    delete parentElement.cebIndex;
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
            parentElement.replaceChild(factory(value), current);
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
 * @param is the value of the attribute is
 * @return {Element} the element
 */
function createElement(name, is) {
    return is ? document.createElement(name, is) : document.createElement(name);
}

/**
 * Handle a {Element}.
 * @param {string} name the name of the element
 * @param {Object.<string, string|number|boolean>} attrs the attributes of the element
 * @param {Object.<string, *>}  props the properties of the element
 * @param {ElementOptions} opts the options driving the creation of the element
 * @return {Element} the handled element
 */
function handleElement(name, attrs = {}, props = {}, opts = {}) {
    const index = nextIndex();
    let current = parentElement.childNodes.item(index);

    if (current && current.nodeName.toLowerCase() !== name.toLowerCase()) {
        let nodeToReplace = current;
        current = createElement(name, attrs.is);
        parentElement.replaceChild(
            current,
            nodeToReplace
        );
    } else if (!current) {
        current = parentElement.appendChild(
            createElement(name, attrs.is)
        );
    }

    console.log('handleElement', name, current, attrs);
    Object.keys(attrs).forEach(k => current.setAttribute(k, attrs[k]));
    Object.keys(props).forEach(k => current[k] = props[k]);


    if (opts.content) {
        rootElement.cebContentNode = current;
    }

    if (!opts.voidElement) {
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
export function fcOpenElement(name, attrs = {}, props = {}, opts = {}) {
    return handleElement(name, attrs, props, opts);
}

/**
 * Close the current element.
 */
export function fcCloseElement() {
    const max = parentElement.childNodes.length;
    for (let i = lastIndex(); i < max; i++) {
        parentElement.removeChild(
            parentElement.childNodes.item(
                parentElement.childNodes.length - 1
            )
        );
    }
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
export function fcOpenVoidElement(name, attrs = {}, props = {}, opts = {}) {
    return handleElement(name, attrs, props, assign(opts, {voidElement: true}));
}

/**
 * To add a <code>ceb-content</code> node.
 * This node will be used to locate the entry of the light DOM structure.
 */
export function fcContent() {
    rootElement.cebContentNode = handleElement('ceb-content', {}, {}, {voidElement: true});
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
