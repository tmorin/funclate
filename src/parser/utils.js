/**
 * @return {*}
 * @private
 */
export function assign() {
    return Array.prototype.reduce.call(arguments, function (target, source) {
        return Object.keys(Object(source)).reduce((target, key) => {
            target[key] = source[key];
            return target;
        }, target);
    });
}

/**
 *
 * @param value
 * @return {XML|string}
 * @private
 */
function stringify(value) {
    return value.replace(/'/gim, '\\\'').replace(/\n/gi, '\\n');
}

/**
 *
 * @param value
 * @param options
 * @return {string}
 * @private
 */
export function interpolate(value, options) {
    let result;
    let statements = [];
    let lastIndex = 0;
    while ((result = options.interpolation.exec(value)) !== null) {
        let full = result[0];
        let group = result[1];
        let index = result.index;
        let before = value.substring(lastIndex, index);
        if (before) {
            statements.push(`'${stringify(before)}'`);
        }
        if (group.trim()) {
            statements.push(`(${group.trim()} === undefined || ${group.trim()} === null ? '' : ${group.trim()})`);
        }
        lastIndex = index + full.length;
    }
    let after = value.substring(lastIndex, value.length);
    if (after) {
        statements.push(`'${stringify(after)}'`);
    }
    return statements.join(' + ');
}
