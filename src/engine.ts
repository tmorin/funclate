/**
 * The map of attributes.
 */
export type Attributes = Array<[string, string | number | boolean]>
/**
 * The map of properties.
 */
export type Properties = Array<[string, any]>
/**
 * The map of options.
 */
export type Options = Partial<{
    /**
     * When true, the current element will be skipped.
     */
    skip: boolean
    /**
     * When true, the current element will be skipped and will be the "slot" location of the container element.
     */
    slot: boolean
}>
/**
 * The parameters.
 */
export type Parameters = Partial<{
    attributes: Attributes
    properties: Properties
    options: Options
}>
/**
 * The render function is used to orchestrate the update operations.
 */
export type RenderFunction = (engine: Engine) => void

type NodeFactory = (document: Document, text?: string) => Node

function sanitize(value) {
    return value === undefined || value === null ? '' : value;
}

class Context {
    constructor(
        public readonly element: HTMLElement,
        private index: number = -1
    ) {
    }

    nextIndex() {
        this.index = this.index + 1
        return this.index
    }

    lastIndex() {
        return this.index + 1
    }
}

class Contexts {
    constructor(
        private readonly element: HTMLElement,
        private readonly stack: Array<Context> = [new Context(element)]
    ) {
    }

    start(element: HTMLElement): void {
        this.stack.unshift(new Context(element))
    }

    stop() {
        this.stack.shift()
    }

    get(): Context {
        return this.stack[0]
    }
}

function createDefaultParams(): Parameters {
    return {
        attributes: [],
        properties: [],
        options: {
            skip: false,
            slot: false,
        },
    }
}

function createTextNode(document: Document, text?: string): Node {
    return document.createTextNode(sanitize(text))
}

function createCommentNode(document: Document, text?: string): Node {
    return document.createComment(sanitize(text))
}

function createElement(document: Document, name: string, attrs: Attributes = []): HTMLElement {
    const isIndex = attrs.findIndex(([key]) => key === "is")
    return isIndex > -1
        ? document.createElement(name, {is: attrs[isIndex][1] as string})
        : document.createElement(name)
}

function removeRemainingNodes(contexts: Contexts) {
    const parentElement = contexts.get().element;
    if (parentElement && parentElement[Engine.PROP_NAME_SLOT] !== parentElement) {
        const lastIndex = contexts.get().lastIndex();
        if (lastIndex > -1) {
            while (parentElement.childNodes.length > lastIndex) {
                parentElement.removeChild(parentElement.lastChild);
            }
        }
    }
}

function updateAttributes(element: HTMLElement, attributes: Attributes = []) {
    const preservedAttributes: Array<string> = element[Engine.PROP_NAME_PRESERVE_ATTRIBUTES] || [];
    const updatedAttributes = [];
    for (const entry of attributes) {
        const name = entry[0]
        if (preservedAttributes.indexOf(name) < 0) {
            const value = entry[1]
            const type = typeof value
            if (type === "boolean") {
                if (value) {
                    element.setAttribute(name, '')
                    updatedAttributes.push(name)
                }
            } else if (type === "number") {
                element.setAttribute(name, value.toString())
                updatedAttributes.push(name)
            } else if (value) {
                element.setAttribute(name, sanitize(value))
                updatedAttributes.push(name)
            }
        }
    }
    Array.from(element.attributes)
        .filter((attr) => updatedAttributes.indexOf(attr.name) < 0)
        .filter((attr) => preservedAttributes.indexOf(attr.name) < 0)
        .forEach((attr) => element.removeAttribute(attr.name));
}

function updateProperties(element: HTMLElement, properties: Properties = []) {
    const updatedProperties = [];
    for (const entry of properties) {
        const name = entry[0]
        element[name] = entry[1]
        updatedProperties.push(name)
    }
    (element[Engine.PROP_NAME_UPDATED_PROPERTIES] || [])
        .filter((attr) => updatedProperties.indexOf(attr.name) < 0)
        .forEach((name) => element[name] = undefined)
    element[Engine.PROP_NAME_UPDATED_PROPERTIES] = updatedProperties
}

/**
 * An engine manages the update of DOM elements.
 *
 * The updates are managed by atomic operations:
 *
 * - open and close an element (i.e. an element with potentially some content like `p`)
 * - add void element (i.e. an element without content like `input`)
 * - write a text
 * - write a comment
 *
 * Once an element is opened, then all subsequent operations impact its direct descendants til it's closure.
 *
 * @example Define a simple text node in an `p` element
 * ```typescript
 * Engine.updateElement(el, (engine) => {
 *   engine.openElement("p")
 *   engine.text("hello")
 *   engine.closeElement()
 * })
 * ```
 * @example Define a input handling only positive numbers
 * ```typescript
 * Engine.updateElement(el, (engine) => {
 *   engine.voidElement("input", {
 *     attributes: [
 *       ["type", "number"],
 *       ["min", "0"],
 *     ]
 *   })
 * })
 * ```
 */
export class Engine {
    /**
     * The value refers to a property name which is only used internally.
     * @private
     */
    static PROP_NAME_UPDATED_PROPERTIES = "__fc_updated_properties"
    /**
     * The value refers to a property name which is only used internally.
     * @private
     */
    static PROP_NAME_SLOT = "__fc_content"
    /**
     * The value refers to a property name which should be used by Custom Element only.
     * The purpose of the property is to list attribute names which won't be mutated.
     * @example Preserve the type and min of an extended input
     * ```typescript
     * class OnlyPositiveNumberInput extends HTMLInputElement {
     *   constructor() {
     *     super()
     *     this[Engine.PROP_NAME_UPDATED_PROPERTIES] = ["type", "min"]
     *     this.type = "number"
     *     this.min = "0"
     *   }
     * }
     * ```
     */
    static PROP_NAME_PRESERVE_ATTRIBUTES = "__fc_preserve_attributes"
    /**
     * The value refers to a property name which should be used by Custom Element only.
     * The purpose of the property is to prevent the mutation of the child nodes.
     * @example Preserve the child nodes of Custom Element
     * ```typescript
     * class SimpleCustomElement extends HTMLElement {
     *   constructor() {
     *     super()
     *     this[Engine.PROP_NAME_PRESERVE_CHILDREN] = true
     *   }
     *   connectedCallback() {
     *     this.textContent = "an initial text content"
     *   }
     * }
     * ```
     */
    static PROP_NAME_PRESERVE_CHILDREN = "__fc_preserve_children"

    private constructor(
        private readonly containerElement: HTMLElement,
        private readonly contexts: Contexts = new Contexts(containerElement),
        private readonly document: Document = containerElement.ownerDocument,
    ) {
    }

    private handleNode(value: string, nodeType: number, createNode: NodeFactory): void {
        const parentElement = this.contexts.get().element
        const index = this.contexts.get().nextIndex()
        let currentNode = parentElement.childNodes.item(index)
        if (currentNode) {
            if (currentNode.nodeType !== nodeType) {
                parentElement.insertBefore(createNode(this.document, value), currentNode)
            } else {
                currentNode.nodeValue = value
            }
        } else {
            parentElement.appendChild(createNode(this.document, value))
        }
    }

    private handleElement(name: string, parameters: Parameters = createDefaultParams()): HTMLElement {
        const parentElement = this.contexts.get().element
        const index = this.contexts.get().nextIndex()
        const currentNode = parentElement.childNodes.item(index)
        let currentElement: HTMLElement;
        if (currentNode) {
            if (currentNode instanceof HTMLElement) {
                currentElement = currentNode
                const currentTagName = currentElement.tagName.toLowerCase()
                const tagName = name.toLowerCase()
                if (currentTagName.localeCompare(tagName) !== 0) {
                    currentElement = parentElement.insertBefore(
                        createElement(this.document, name, parameters.attributes),
                        currentNode
                    )
                }
            } else {
                currentElement = parentElement.insertBefore(
                    createElement(this.document, name, parameters.attributes),
                    currentNode
                )
            }
        } else {
            currentElement = this.contexts.get().element.appendChild(
                createElement(this.document, name, parameters.attributes)
            )
        }

        updateAttributes(currentElement, parameters.attributes)
        updateProperties(currentElement, parameters.properties)

        return currentElement
    }

    /**
     * Open an HTML element.
     * @param name the tag name of the element
     * @param parameters optional attributes, properties and additional options
     */
    openElement(name: string, parameters?: Parameters): void {
        const element = this.handleElement(name, parameters)
        if (parameters?.options?.slot) {
            this.containerElement[Engine.PROP_NAME_SLOT] = element
        }
        if (parameters?.options?.slot || parameters?.options?.skip || element[Engine.PROP_NAME_PRESERVE_CHILDREN]) {
            this.contexts.start(null)
        } else {
            this.contexts.start(element)
        }
    }

    /**
     * Close the current opened HTML element.
     */
    closeElement(): void {
        removeRemainingNodes(this.contexts)
        this.contexts.stop()
    }

    /**
     * Open a "void" HTML element like the `input` element.
     * @param name the tag name of the element
     * @param parameters optional attributes, properties and additional options
     */
    voidElement(name: string, parameters?: Parameters): void {
        this.handleElement(name, parameters)
    }

    /**
     * Append a slot element.
     */
    slot(): void {
        this.containerElement[Engine.PROP_NAME_SLOT] = this.handleElement("fc-slot", {
            options: {
                skip: true
            }
        })
    }

    /**
     * Define a comment node.
     * @param text the value of the comment node
     */
    comment(text?: string): void {
        this.handleNode(
            text,
            this.document.COMMENT_NODE,
            createCommentNode
        )
    }

    /**
     * Define a text node.
     * @param text the value of the text node
     */
    text(text?: string): void {
        this.handleNode(
            text,
            this.document.TEXT_NODE,
            createTextNode
        )
    }

    /**
     * Update the given HTML element and the underlying descendants.
     * The operations orchestrating the updates are driven by a given function.
     * @param element the HTML element to update
     * @param render the function expressing the update operations
     * @param parameter parameters of the Update Element process
     */
    static updateElement(element: HTMLElement, render: RenderFunction, parameter?: Partial<UpdateElementParameters>) {
        let lightFrag = null;
        if (parameter?.greyDom) {
            if (!element[Engine.PROP_NAME_SLOT]) {
                lightFrag = element.ownerDocument.createDocumentFragment();
                while (element.childNodes.length > 0) {
                    lightFrag.appendChild(element.removeChild(element.firstChild));
                }
                element[Engine.PROP_NAME_SLOT] = element
            }
        }

        const contexts = new Contexts(element)
        const engine = new Engine(element, contexts)
        render(engine)
        removeRemainingNodes(contexts)

        if (lightFrag) {
            let slotElement = element[Engine.PROP_NAME_SLOT];
            while (slotElement[Engine.PROP_NAME_SLOT]) {
                slotElement = slotElement[Engine.PROP_NAME_SLOT]
            }
            slotElement.appendChild(lightFrag);
        }
    }

}

/**
 * Parameters of te update element process.
 */
export type UpdateElementParameters = {
    /**
     * When true, the Grey DOM feature is handled.
     * That means at the creation of the element, the children discovered from the Light DOM will moved to found the slot element.
     * Somehow it create a Grey DOM lying between the Light DOM and the Shadow DOM.
     */
    greyDom: boolean
}
