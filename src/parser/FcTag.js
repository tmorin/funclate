/**
 * Base class for funclate's tag implementations.
 * @abstract
 */
export class FcTag {
    /**
     * Invoked when starting tag of the element is found.
     * @param {Factory} factory the factory
     * @param {string} name the name
     * @param {Map.<Attribute>} attributes the attributes
     * @param {boolean} selfClosing
     */
    startTag(factory, name, attributes, selfClosing) {
    }

    /**
     * Invoked when ending tag of the element is found.
     * @param {Factory} factory the factory
     * @param {string} name the name
     */
    endTag(factory, name) {
    }
}
