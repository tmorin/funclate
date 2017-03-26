import {parse} from '../parser';
import loaderUtils from 'loader-utils';

/**
 * @ignore
 */
module.exports = function (source, b, c, d) {
    const options = Object.assign(
        {},
        loaderUtils.getOptions(this || {}),
        {output: 'string'}
    );
    const factory = parse(source, options);
    return 'module.exports = ' + factory + ';';
};

