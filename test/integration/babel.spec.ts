import {strict as assert} from 'assert';
import babelFunclate from '../../src/integration/babel';

const babel = require('@babel/core');

describe('babel', () => {
    it('should convert an funclate file into a string function', (done) => {
        let options = {
            plugins: [babelFunclate]
        }
        babel.transformFile('test/integration/dummy.es6', options, (err, result) => {
            if (err) {
                return done(err)
            }
            assert.ok(result.code.indexOf(`fcOpenElement('p', ['class', 'foo ' + (el.bar === undefined || el.bar === null ? '' : el.bar)], [], []);`) > -1)
            assert.ok(result.code.indexOf(`fcText('Hello');`) > -1)
            assert.ok(result.code.indexOf(`fcCloseElement();`) > -1)
            done()
        })
    })
})
