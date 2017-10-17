import {Funclate, Map, RenderFactory, RenderFunction} from './parser/model';
import {Context, ElementOptions, NodeFactory, ParentElement, RootElement} from './runtime/model';
import {findNodeFromKey, fromArrayToObject, sanitize, updateAttributes, updateProperties} from './runtime/utils';

/**
 * The current root element, i.e. where the starting point of the updateElement function.
 * @type {Element}
 */
let rootElement: RootElement = null;

/**
 * The current document owning the current root element
 * @type {Document}
 */
let rootDocument: Document = null;

/**
 * The current parent element of the processed instruction.
 * @type {Element}
 */
let parentElement: ParentElement = null;

/**
 * Build a context object.
 * @return {Context} the context
 */
function getCtx(): Context {
    return {root: rootElement, parent: parentElement, document: rootDocument};
}

/**
 * Restore a context object.
 * @param {Context} ctx the context to restore
 */
function restoreCtx(ctx: Context): void {
    rootElement = ctx.root;
    parentElement = ctx.parent;
    rootDocument = ctx.document;
}

/**
 * Remove the un-visited nodes.
 */
function cleanRemainingNodes(): void {
    if (rootElement.__content__ !== parentElement) {
        while (parentElement.childNodes.length > lastIndex()) {
            parentElement.removeChild(parentElement.lastChild);
        }
    }
}

/**
 * Get and increment the fcIndex property of the current parent.
 * @return the index
 */
function nextIndex(): number {
    if (!parentElement.fcIndex) {
        parentElement.fcIndex = 0;
    }
    const index = parentElement.fcIndex;
    parentElement.fcIndex = parentElement.fcIndex + 1;
    return index;
}

/**
 * Get fcIndex property of the current parent.
 * @return the index
 */
function lastIndex(): number {
    return parentElement.fcIndex || 0;
}

/**
 * Clear the fcIndex property of the current parent.
 */
function clearIndex(): void {
    delete parentElement.fcIndex;
}

/**
 * Handle a Node.
 * @param {string} value the node's value
 * @param {number} nodeType the node's type
 * @param {NodeFactory} factory the factory creating the node when necessary
 * @return {Node} the handled node
 */
function handleNode(value: string, nodeType: number, factory: NodeFactory): Node {
    const index = nextIndex();
    const current = parentElement.childNodes.item(index);

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
 * @param {string} name the name
 * @param {string[]} attrs the attributes
 * @return {HTMLElement} the element
 */
function createElement(name: string, attrs: string[]): HTMLElement {
    const index = attrs ? attrs.indexOf('is') : -1;
    return index > -1
        ? rootDocument.createElement.apply(rootDocument, [name, attrs[index + 1]])
        : rootDocument.createElement(name);
}

/**
 * Handle an element.
 * @param {string} name the name
 * @param {any[]} attrs the attributes
 * @param {any[]} props the properties
 * @param {ElementOptions} opts the options
 * @return {HTMLElement} the handled element
 */
function handleElement(name: string, attrs: any[], props: any[], opts: ElementOptions): HTMLElement {
    const index = nextIndex();
    let current = parentElement.childNodes.item(index) as HTMLElement;

    let found = opts.found ? opts.found : null;
    if (!found && opts.key) {
        found = findNodeFromKey(parentElement, lastIndex(), opts.key);
    }

    if (found) {
        if (current !== found) {
            current = parentElement.insertBefore(found, current) as HTMLElement;
        }
    } else if (current) {
        if (name.toLowerCase() !== (current.tagName || '').toLowerCase()) {
            current = parentElement.insertBefore(
                createElement(name, attrs), current
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

const funclate: Funclate = {
    closeElement,
    comment,
    content,
    createThenUpdate,
    openElement,
    text,
    updateElement,
    voidElement
};

/**
 * Update the sub tree of the given root according to a given factory of the render function.
 * @param {RenderFactory} factory the render factory
 * @param {HTMLElement} root the root element
 * @param {Map<any>} context the context
 * @return {RenderFunction} the render function
 */
export function createThenUpdate(factory: RenderFactory, root: HTMLElement, context: Map<any> = {}): RenderFunction {
    const render = factory(funclate);
    updateElement(factory(funclate), root, context);
    return render;
}

/**
 * Update the sub tree of the given root according to the given render function.
 * @param {RenderFunction} render the render function
 * @param {RootElement} root the root element
 * @param {Context} context the context
 */
export function updateElement(render: RenderFunction, root: RootElement, context: Map<any> = {}): void {
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

    render(root, context);

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
 * @param {string} name the name of the element
 * @param {any[]} attrs the attributes of the element
 * @param {any[]} props the properties of the element
 * @param {any[]} opts the options driving the creation of the element, c.f. {@link ElementOptions}
 * @return {HTMLElement} the element
 */
export function openElement(name: string, attrs: any[] = [], props: any[] = [], opts: any[] = []): HTMLElement {
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
export function closeElement(): void {
    cleanRemainingNodes();
    clearIndex();
    parentElement = parentElement.parentElement;
}

/**
 * Open and close a void element.
 * @param {string} name the name of the element
 * @param {string[]} attrs the attributes of the element
 * @param {any[]} props the properties of the element
 * @param {any[]} opts the options driving the creation of the element, c.f. {@link ElementOptions}
 * @return {HTMLElement} the element
 */
export function voidElement(name: string, attrs: string[] = [], props: any[] = [], opts: any[] = []): HTMLElement {
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
export function content(): void {
    rootElement.__content__ = handleElement('fc-content', null, null, {
        found: rootElement.__content__,
        skipChildren: true
    });
}

/**
 * Create a text node.
 * @param {string} value the node value
 * @returns {Text} the text
 */
function textNodeFactory(value: string = ''): Text {
    return rootDocument.createTextNode(sanitize(value));
}

/**
 * Create a text node.
 * @param {string} value the comment value
 * @returns {Comment} the comment
 */
function commentFactory(value = ''): Comment {
    return rootDocument.createComment(sanitize(value));
}

/**
 * To write a text node.
 * @param {string} value the text
 * @return {Node} the text node
 */
export function text(value: string = ''): Text {
    return handleNode(value, rootElement.TEXT_NODE, textNodeFactory) as Text;
}

/**
 * To write a comment node.
 * @param {string} value the comment
 * @return {Node} the comment node
 */
export function comment(value: string = ''): Comment {
    return handleNode(value, rootElement.COMMENT_NODE, commentFactory) as Comment;
}
