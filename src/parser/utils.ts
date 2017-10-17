import {ParserOptions} from './ParserOptions';

/**
 * Assign to the first objects the following
 * @param {Object} args the objects list
 * @return {Object} the first object
 */
export function assign(...args: object[]): object {
    return Array.prototype.reduce.call(arguments, (target, source) => {
        return Object.keys(Object(source)).reduce((t, k) => {
            t[k] = source[k];
            return t;
        }, target);
    });
}

function stringify(value: string): string {
    return value
        .replace(/'/gim, '\\\'')
        .replace(/\n/gi, '\\n');
}

/**
 * Interpolate the given value.
 * @param {string} value the value
 * @param {ParserOptions} options the options
 * @return {string} the interpolated value
 */
export function interpolate(value: string, options: ParserOptions): string {
    let result;
    const statements = [];
    let lastIndex = 0;
    while ((result = options.interpolation.exec(value)) !== null) {
        const full = result[0];
        const group = result[1];
        const index = result.index;
        const before = value.substring(lastIndex, index);
        if (before) {
            statements.push(`'${stringify(before)}'`);
        }
        if (group.trim()) {
            statements.push(`(${group.trim()} === undefined || ${group.trim()} === null ? '' : ${group.trim()})`);
        }
        lastIndex = index + full.length;
    }
    const after = value.substring(lastIndex, value.length);
    if (after) {
        statements.push(`'${stringify(after)}'`);
    }
    return statements.join(' + ');
}

/**
 * Converts string to camel case.
 * @param {string} value the string to convert
 * @return {string} the camel cased string
 */
export function toCamelCase(value: string): string {
    return value.toLowerCase()
        .split('-')
        .map((part, index) => index ? part.charAt(0).toUpperCase() + part.slice(1) : part).join('');
}
