import babelFunclate from '../../src/integration/babel.js';
import {expect} from 'chai';
const babel = require('babel-core');

describe('babel', () => {

    it('should convert an funclate file into a string function', (done) => {
        let options = {
            plugins: [babelFunclate]
        };
        babel.transformFile('test/integration/dummy.es6', options, (err, result) => {
            if (err) {
                return done(err);
            }
            expect(result.code).to.contain(`fcOpenElement('p', ['class', 'foo ' + (el.bar === undefined || el.bar === null ? '' : el.bar)], [], []);`);
            expect(result.code).to.contain(`fcText('Hello');`);
            expect(result.code).to.contain(`fcCloseElement();`);
            done();
        });
    });

});
