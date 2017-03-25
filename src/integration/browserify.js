import {parse} from '../parser';
import {makeStringTransform} from 'browserify-transform-tools';

const options = {
    includeExtensions: ['.funclate', '.fc']
};

/**
 * @ignore
 */
export default makeStringTransform('idomizerify', options, (content, transformOptions, done) => {
    transformOptions.config.output = 'string';
    parse(content, transformOptions.config, (err, render) => {
        if (err) {
            done(err);
        } else {
            done(null, 'module.exports = ' + render + ';');
        }
    });
});
