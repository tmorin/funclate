import {runTransform} from 'browserify-transform-tools';
import {expect} from 'chai';
import {join} from 'path';
import idomizerify from '../../src/integration/browserify';

describe('browserify', () => {

    it('should convert a funclate file into a string function', (done) => {
        const dummyJsFile = join(__dirname, 'plugins/dummy.fc');
        const content = `<p class="foo {{el.bar}}">Hello</p>`;
        runTransform(idomizerify, dummyJsFile, {content, config: {skipExceptions: false}}, (err, result) => {
            if (err) {
                return done(err);
            }
            expect(result).to.contain(`fcOpenElement('p', ['class', 'foo ' + (el.bar === undefined || el.bar === null ? '' : el.bar)], [], []);`);
            expect(result).to.contain(`fcText('Hello');`);
            expect(result).to.contain(`fcCloseElement();`);
            done();
        });
    });

});
