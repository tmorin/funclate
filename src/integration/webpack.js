import {parse} from '../parser';
import loaderUtils from 'loader-utils';

/**
 * @ignore
 */
module.exports = function (source) {
    const callback = this.async();
    const options = loaderUtils.getOptions(this);
    options.output = 'string';
    parse(source, options, (err, render) => {
        if (err) {
            callback(err);
        } else {
            callback(null, 'module.exports = ' + render + ';');
        }
    });
};

