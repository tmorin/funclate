/**
 * Convert a value to an array.
 * @param {*} value the value to convert
 * @returns {Array} the array
 */
export function toArray(value) {
    return value ? Array.prototype.slice.call(value) : [];
}

/**
 * Convert undefined and null value to empty string.
 * @param {string} value the value to sanitize
 * @returns {string} the sanitized value
 */
export function sanitize(value) {
    return value === undefined || value === null ? '' : value;
}

/**
 * Transform an array to an object.
 * The first value is the key, the second its value and so one.
 * @param {Array} array the array
 * @returns {object} the object
 */
export function fromArrayToObject(array) {
    const object = {};
    if (!array) {
        return object;
    }
    const max = array.length;
    for (let i = 0; i < max; i = i + 2) {
        object[array[i]] = array[i + 1];
    }
    return object;
}


/**
 * According to the given parent, try to find a node matching with the given key.
 * @param {!Element} parent the parent element
 * @param {!number} from the index of the starting node
 * @param {!string} key the key to find
 * @returns {Node}
 */
export function findNodeFromKey(parent, from, key) {
    const end = parent.childNodes.length;
    for (let i = from; i < end; i++) {
        const child = parent.childNodes.item(i);
        if (child.dataset && child.dataset.fcKey === key) {
            return child;
        }
    }
}

/**
 * Update the given element's attributes according to the new one.
 * @param {!Element} element the element
 * @param {Array.<undefined|null|string|number|boolean>} [attributes] the new attributes
 */
export function updateAttributes(element, attributes) {
    attributes = attributes ? attributes : [];
    let updatedAttributes = {};
    let max = attributes.length;
    for (let i = 0; i < max; i = i + 2) {
        let name = attributes[i];
        let value = attributes[i + 1];
        let type = typeof value;
        if (type === 'boolean') {
            if (value) {
                element.setAttribute(name, '');
                updatedAttributes[name] = true;
            }
        } else if (type === 'number') {
            element.setAttribute(name, value);
            updatedAttributes[name] = true;
        } else if (value) {
            element.setAttribute(name, sanitize(value));
            updatedAttributes[name] = true;
        }
    }
    toArray(element.attributes)
        .filter(attr => !updatedAttributes[attr.name])
        .forEach(attr => element.removeAttribute(attr.name));
}
/**
 * Update the given element's properties according to the new one.
 * @param {!Element} element the element
 * @param {Array} [properties] the new attributes
 */
export function updateProperties(element, properties) {
    properties = properties ? properties : [];
    let updatedProperties = {};
    let max = properties.length;
    for (let i = 0; i < max; i = i + 2) {
        let name = properties[i];
        element[name] = properties[i + 1];
        updatedProperties[name] = true;
    }
    toArray(element.updatedProperties)
        .filter(name => !updatedProperties[name])
        .forEach(name => element[name] = undefined);
    element.updatedProperties = Object.keys(updatedProperties);
}
