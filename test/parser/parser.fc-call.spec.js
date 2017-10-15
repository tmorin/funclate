/*jshint -W030 */
import {parse} from '../../src/parser';
import * as funclate from '../../src/runtime';
import {updateElement} from '../../src/runtime';

describe('FcCall and fc-call', () => {
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

    it('should work', () => {
        const html1 = `<fc-call name="ctx.embeddedRender"/>`;
        const factory1 = parse(html1, {pretty: true});

        const html2 = '<p class="foo {{ el.bar }}"></p>';
        const factory2 = parse(html2, {pretty: true});

        updateElement(factory1(funclate), el, {
            embeddedRender: factory2(funclate)
        });

        expect(el.outerHTML, '1').to.be.eq('<div><p class="foo "></p></div>');
    });

});
