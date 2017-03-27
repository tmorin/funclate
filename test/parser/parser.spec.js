/*jshint -W030 */
import {parse} from '../../src/parser';
import {createThenUpdate} from '../../src/runtime';

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

    it('should render a string function', () => {
        const html = '<p class="foo {{ el.bar }}"></p>';
        const factory = parse(html, {pretty: false, output: 'string'});
        expect(factory).to.contain(`fcOpenElement('p', ['class', 'foo ' + (el.bar === undefined || el.bar === null ? '' : el.bar)], [], []);`);
        expect(factory).to.contain(`fcCloseElement();`);
    });

    it('should parse and render a very simple template', () => {
        const html = '<p>foo<!--comment--></p>';
        const factory = parse(html, {pretty: true});
        createThenUpdate(el, factory);
        expect(el.innerHTML, '1').to.be.eq(html);
    });

    it('should interpolate inline statement into text()', () => {
        const html = '<p>before {{ el.foo }} between {{ el.bar }} after{{ }}</p>';
        const factory = parse(html, {pretty: true});
        el.foo = 'foo';
        el.bar = 'bar';
        createThenUpdate(el, factory);
        expect(el.innerHTML, '1').to.be.eq('<p>before foo between bar after</p>');
    });

    it('should interpolate attribute value', () => {
        const html = '<p class="before {{ el.foo }} between {{ el.bar }} after">content</p>';
        const factory = parse(html, {pretty: true});
        el.foo = 'foo';
        el.bar = 'bar';
        createThenUpdate(el, factory);
        expect(el.innerHTML, '1').to.be.eq('<p class="before foo between bar after">content</p>');

        el.bar = undefined;
        createThenUpdate(el, factory);
        expect(el.innerHTML, '1').to.be.eq('<p class="before foo between  after">content</p>');
    });

    it('should clean unset attribute', () => {
        const html = '<input foo="{{el.foo}}" />';
        const factory = parse(html, {pretty: true});
        el.innerHTML = '<input bar="bar" />';
        el.foo = 'foo';
        createThenUpdate(el, factory);
        expect(el.innerHTML, '1').to.be.eq('<input foo="foo">');
    });

    it('should interpolate property value', () => {
        const html = '<input #value="{{ el.foo }}" />';
        const factory = parse(html, {pretty: true});
        el.foo = 'foo';
        createThenUpdate(el, factory);
        expect(el.querySelectorAll('input').item(0).value, '1').to.be.eq('foo');

        el.foo = 'bar';
        createThenUpdate(el, factory);
        expect(el.querySelectorAll('input').item(0).value, '2').to.be.eq('bar');
    });

    it('should interpolate property value with -', () => {
        const html = '<input type="date" #value-alt-date="{{ el.foo }}" />';
        const factory = parse(html, {pretty: true});
        el.foo = new Date();
        createThenUpdate(el, factory);
        expect(el.querySelectorAll('input').item(0).valueAltDate, '1').to.be.eq(el.foo);
    });

});
