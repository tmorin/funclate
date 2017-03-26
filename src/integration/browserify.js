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
    const factory = parse(content, transformOptions.config);
    done(null, 'module.exports = ' + factory + ';');
});
