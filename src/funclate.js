function assign() {
    return Array.prototype.reduce.call(arguments, function (target, source) {
        return Object.keys(Object(source)).reduce((target, key) => {
            target[key] = source[key];
            return target;
        }, target);
    });
}


/**
 * The current root element, i.e. where the starting point of the updateElement function.
 * @type {Node}
 */
let rootElement = null;

/**
 * The current parent element of the processed instruction.
 * @type {Element}
 */
let parentElement = null;

/**
 * @typedef Context
 * @type {object}
 * @property {Node} root the root element
 * @property {Element} parent the parent element
 */

/**
 * @typedef ElementOptions
 * @type {object}
 * @property {boolean} content if true the element will be the entry of the light DOM structure
 * @property {boolean} skipChildren if true the children's element won't be parsed
 * @property {Node} found will be used as current node
 */

/**
 * Build a context object.
 * @return {Context} the context
 */
function getCtx() {
    return {root: rootElement, parent: parentElement};
}

/**
 * Restore a context object.
 * @param {!Context} ctx the context to restore
 */
function restoreCtx(ctx) {
    rootElement = ctx.root;
    parentElement = ctx.parent;
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
    const is = attrs && attrs.is;
    return is ? document.createElement(name, is) : document.createElement(name);
}

/**
 * According to the current context, try to find a node matching with the given key.
 * @param {string} key the key
 * @return {Node|undefined}
 */
function findNodeFromKey(key) {
    const from = lastIndex();
    const end = parentElement.childNodes.length;
    for (let i = from; i < end; i++) {
        const child = parentElement.childNodes.item(i);
        if (child.dataset && child.dataset.fcKey === key) {
            return child;
        }
    }
}

/**
 * Handle a {Element}.
 * @param {!string} name the name of the element
 * @param {Object.<string, string|number|boolean>} [attrs] the attributes of the element
 * @param {Object.<string, *>}  [props] the properties of the element
 * @param {ElementOptions} [opts] the options driving the creation of the element
 * @return {Element} the handled element
 */
function handleElement(name, attrs, props, opts = {}) {
    const index = nextIndex();
    let current = parentElement.childNodes.item(index);

    let found = opts.found ? opts.found : null;
    if (!found && opts.key) {
        found = findNodeFromKey(opts.key);
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

    if (attrs) {
        Object.keys(attrs).forEach(k => current.setAttribute(k, attrs[k]));
    }

    if (props) {
        Object.keys(props).forEach(k => current[k] = props[k]);
    }

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

function fromArrayToObject(array) {
    if (!array) {
        return array;
    }
    const object = {};
    const max = array.length;
    for (let i = 0; i < max; i = i + 2) {
        object[array[i]] = array[i + 1];
    }
    return object;
}

/**
 * Open an element.
 * @param {!string} name the name of the element
 * @param {Array.<undefined|null|string|number|boolean>} [attrs] the attributes of the element
 * @param {Array.<*>} [props] the properties of the element
 * @param {Array.<*>} [opts] the options driving the creation of the element
 * @return {Element} the element
 */
export function openElement(name, attrs, props, opts) {
    return handleElement(
        name,
        fromArrayToObject(attrs),
        fromArrayToObject(props),
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
 * @param {Object.<string, string|number|boolean>} [attrs] the attributes of the element
 * @param {Object.<string, *>} [props] the properties of the element
 * @param {ElementOptions} [opts] the options driving the creation of the element
 * @return {Element} the element
 */
export function voidElement(name, attrs, props, opts = []) {
    return handleElement(
        name,
        fromArrayToObject(attrs),
        fromArrayToObject(props),
        assign({skipChildren: true}, fromArrayToObject(opts))
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
function textNodeFactory(value = '') {
    return document.createTextNode(value);
}

/**
 * Create a text node.
 * @param {string} [value] the node value
 * @returns {Comment}
 */
function commentFactory(value = '') {
    return document.createComment(value);
}

/**
 * To write a text node.
 * @param {string} [text] the text
 * @return {Node} the text node
 */
export function text(text) {
    return handleNode(text, Node.TEXT_NODE, textNodeFactory, null);
}

/**
 * To write a comment node.
 * @param {string} [text] the comment
 * @return {Node} the comment node
 */
export function comment(text) {
    return handleNode(text, Node.COMMENT_NODE, commentFactory, null);
}
