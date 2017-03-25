/*jshint -W030 */
import {parse} from '../../src/parser';
import * as funclate from '../../src/runtime';
import {updateElement} from '../../src/runtime';

describe('parse()', () => {
    let el;
    beforeEach(() => {
        if (el) {
            el.parentNode.removeChild(el);
        }
        el = document.body.appendChild(document.createElement('div'));
    });

    afterEach(() => {
        el.innerHTML = '';
    });

    it('should render a string function', done => {
        const html = '<p class="foo {{ el.bar }}"></p>';
        parse(html, {output: 'string'}, (err, factory) => {
            if (err) {
                return done(err);
            }
            expect(factory).to.contain(`fcOpenElement('p', ['class', 'foo ' + (el.bar === undefined || el.bar === null ? '' : el.bar)], [], undefined);`);
            expect(factory).to.contain(`fcCloseElement();`);
            done();
        });
    });

    it('should parse and render a very simple template', done => {
        const html = '<p>foo<!--comment--></p>';
        parse(html, null, (err, factory) => {
            if (err) {
                return done(err);
            }
            updateElement(el, factory(funclate));
            expect(el.innerHTML, '1').to.be.eq(html);
            done();
        });
    });

    it('should interpolate inline statement into text()', done => {
        const html = '<p>before {{ el.foo }} between {{ el.bar }} after{{ }}</p>';
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

            el.bar = undefined;
            updateElement(el, factory(funclate));
            expect(el.innerHTML, '1').to.be.eq('<p class="before foo between  after">content</p>');

            done();
        });
    });

    it('should clean unset attribute', done => {
        const html = '<input foo="{{el.foo}}" />';
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.innerHTML = '<input bar="bar" />';
            el.foo = 'foo';
            updateElement(el, factory(funclate));
            expect(el.innerHTML, '1').to.be.eq('<input foo="foo">');

            done();
        });
    });

    it('should interpolate property value', done => {
        const html = '<input #value="{{ el.foo }}" />';
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.foo = 'foo';
            updateElement(el, factory(funclate));
            expect(el.querySelectorAll('input').item(0).value, '1').to.be.eq('foo');

            el.foo = 'bar';
            updateElement(el, factory(funclate));
            expect(el.querySelectorAll('input').item(0).value, '2').to.be.eq('bar');

            done();
        });
    });

});
