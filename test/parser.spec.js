/*jshint -W030 */
import {parse} from "../src/parser";
import * as funclate from "../src/funclate";
import {updateElement} from "../src/funclate";

describe.skip('parse()', () => {
    let sandbox, el;
    beforeEach(() => {
        if (sandbox) {
            sandbox.parentNode.removeChild(sandbox);
        }
        sandbox = document.body.appendChild(document.createElement('div'));
        el = sandbox.appendChild(document.createElement('div'));
    });

    afterEach(() => {
        //sandbox.innerHTML = '';
    });

    it('should parse and render a very simple template', done => {
        const html = '<p>foo</p>';
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }
            updateElement(el, factory(funclate));
            expect(el.innerHTML, '1').to.be.eq(html);
            done();
        });
    });

    it('should interpolate inline statement into text()', done => {
        const html = '<p>before {{ el.foo }} between {{ el.bar }} after</p>';
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.foo = 'foo';
            el.bar = 'bar';
            updateElement(el, factory(funclate));
            expect(el.innerHTML, '1').to.be.eq('<p>before foo between bar after</p>');

            done();
        });
    });

    it('should interpolate attribute value', done => {
        const html = '<p class="before {{ el.foo }} between {{ el.bar }} after">content</p>';
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.foo = 'foo';
            el.bar = 'bar';
            updateElement(el, factory(funclate));
            expect(el.innerHTML, '1').to.be.eq('<p class="before foo between bar after">content</p>');

            done();
        });
    });

    it('should interpolate property value', done => {
        const html = '<input @value="{{ el.foo }}" /><input data-@value="{{ el.bar }}"/>';
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.foo = 'foo';
            el.bar = 'bar';
            updateElement(el, factory(funclate));
            expect(el.querySelectorAll('input').item(0).value, '1').to.be.eq('foo');
            expect(el.querySelectorAll('input').item(1).value, '2').to.be.eq('bar');

            done();
        });
    });

});
