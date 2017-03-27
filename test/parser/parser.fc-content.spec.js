/*jshint -W030 */
import {parse} from '../../src/parser';
import * as funclate from '../../src/runtime';
import {updateElement} from '../../src/runtime';

describe('FcContent and fc-content', () => {
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

    it('should work with tag', () => {
        const html = `<fc-content></fc-content>`;
        const factory = parse(html, {pretty: true});
        el.items = [1, 2, 3, 4, 5];
        updateElement(el, factory(funclate));
        expect(el.__content__, '1').to.be.eq(el.querySelector('fc-content'));
    });

    it('should work with attribute', () => {
        const html = `<div fc-content></div>`;
        const factory = parse(html, {pretty: true});
        el.items = [1, 2, 3, 4, 5];
        updateElement(el, factory(funclate));
        expect(el.__content__, '1').to.be.eq(el.querySelector('div'));
    });

});
