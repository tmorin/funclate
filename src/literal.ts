import {Attributes, Engine, Options, Parameters, Properties, UpdateElementParameters} from "./engine";
import {Attribute, parse} from "./parser";

const PATTERN_FC_VALUE_INDEX = /{{fc_value_index:([0-9]+)}}/gm
const PREFIX_FC_VALUE_INDEX = "{{fc_value_index:"
const SUFFIX_FC_VALUE_INDEX = "}}"
const PREFIX_FC_PROPERTY = "p:"
const PREFIX_FC_OPTION = "o:"

function toCamelCase(string = '') {
    return string.toLowerCase()
        .split('-')
        .map((part, index) => index ? part.charAt(0).toUpperCase() + part.slice(1) : part).join('');
}

function fromStringToValues(string: string = "", args: Array<any> = []): Array<any> {
    const values: Array<any> = []
    const r = new RegExp(PATTERN_FC_VALUE_INDEX)
    let cursorFrom = 0
    let cursorTo = 0
    let match: RegExpExecArray;
    while (match = r.exec(string)) {
        cursorTo = match.index
        const textValue = string.substring(cursorFrom, cursorTo)
        if (textValue) {
            values.push(textValue)
        }
        const argIndex = match[1]
        const argValue = args[argIndex]
        values.push(argValue)
        cursorFrom = cursorTo + match[0].length
    }
    const finalTextValue = string.substring(cursorFrom)
    if (finalTextValue) {
        values.push(finalTextValue)
    }
    return values
}

function fromValuesToOperations(values: Array<any>, accumulator: (operations: Operations, value: any) => void): Operations {
    const operations = new Operations()
    values.forEach(value => {
        if (value instanceof Operations) {
            operations.push(value)
        } else if (Array.isArray(value)) {
            for (let item of value) {
                if (item instanceof Operations) {
                    operations.push(item)
                } else {
                    accumulator(operations, item)
                }
            }
        } else {
            accumulator(operations, value)
        }
    })
    return operations
}

function generateParameters(tagAttrs: Array<Attribute> = [], args: Array<any>): Partial<Parameters> {
    const attributes: Attributes = []
    const properties: Properties = []
    const options: Options = {}
    tagAttrs.forEach(({name: attrName, value: attrValue}) => {
        const values = fromStringToValues(attrValue, args)
        const value = values.length === 1 ? values[0] : values.join("")
        const isProperty = attrName.startsWith(PREFIX_FC_PROPERTY)
        const isOption = attrName.startsWith(PREFIX_FC_OPTION)
        if (isProperty) {
            const propName = toCamelCase(attrName.replace(PREFIX_FC_PROPERTY, ""))
            properties.push([propName, value])
        } else if (isOption) {
            const optName = toCamelCase(attrName.replace(PREFIX_FC_OPTION, ""))
            options[optName] = value === "" || value === attrName ? true : value
        } else {
            const sanitizedAttrValue = value === attrName ? "" : value
            attributes.push([attrName, sanitizedAttrValue])
        }
    })
    return {attributes, properties, options}
}

/**
 * A template updates a DOM element from a set of operations.
 * The operations are discovered during the parsing of a _funclate literal_ statement, c.f. {@link funclate}.
 */
export interface Template {
    /**
     * Update the content of an element.
     * @param element the element where render the template
     * @param parameters the parameters of the rendering
     */
    render(element: HTMLElement, parameters?: UpdateElementParameters): void
}

type Operation = (engine: Engine) => void

class Operations implements Template {
    constructor(
        private readonly operations: Array<Operation> = []
    ) {
    }

    push(value: Operations | Operation) {
        if (value instanceof Operations) {
            value.operations.forEach(o => this.operations.push(o))
        } else {
            this.operations.push(value)
        }
    }

    render(element: HTMLElement, parameters?: UpdateElementParameters) {
        Engine.updateElement(element, engine => {
            this.operations.forEach(operation => operation(engine))
        }, parameters)
    }
}

const stringsCaches = new WeakMap<TemplateStringsArray, string>()

/**
 * This function is a [tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)
 * which converts a [literal statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literal)
 * to a {@link Template}.
 * The template can then be used to update the DOM.
 * @param strings the strings
 * @param args the arguments
 * @example Render a simple greeting
 * ```typescript
 * import {funclate, Template} from 'funclate'
 * const name = "World"
 * const template : Template = funclate`<p>Hello, ${name}!</p>`
 * template.render(document.body)
 * ```
 */
export function funclate(strings: TemplateStringsArray, ...args: Array<any>): Template {
    if (!stringsCaches.has(strings)) {
        stringsCaches.set(strings, strings.map(
            (text, index) =>
                `${text}${typeof args[index] !== "undefined" ? `${PREFIX_FC_VALUE_INDEX}${index}${SUFFIX_FC_VALUE_INDEX}` : ""}`
        ).join(""))
    }

    const operations = new Operations()
    parse(stringsCaches.get(strings), {
        openTag(name: string, attrs: Array<Attribute>, selfClosing: boolean) {
            const {attributes, properties, options} = generateParameters(attrs, args)
            operations.push(engine => engine.openElement(name, {attributes, properties, options}))
            if (selfClosing) {
                operations.push(engine => engine.closeElement())
            }
        },
        closeTag() {
            operations.push(engine => engine.closeElement())
        },
        text(data: string) {
            const values = fromStringToValues(data, args);
            operations.push(fromValuesToOperations(values, (operations1, value) => operations1.push(engine => engine.text(value))))
        },
        comment(data: string) {
            const values = fromStringToValues(data, args);
            operations.push(fromValuesToOperations(values, (operations1, value) => operations1.push(engine => engine.comment(value))))
        }
    });
    return operations
}
