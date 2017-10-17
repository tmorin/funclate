import {expect} from 'chai';
import {parse} from '../../src/parser';
import * as funclate from '../../src/runtime';
import {updateElement} from '../../src/runtime';

describe('FcIf', () => {
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

    it('should manage boolean condition', () => {
        const html = `
            <fc-if fc-condition="el.condition === 'if'">
                if
            <fc-else-if fc-condition="el.condition === 'else-if'"/>
                else-if
            <fc-else/>
                else
            </fc-if>
        `;
        const factory = <Function> parse(html, {pretty: true});
        el.condition = 'if';
        updateElement(factory(funclate), el);
        expect(el.textContent.trim(), 'if').to.be.eq('if');

        el.condition = 'else-if';
        updateElement(factory(funclate), el);
        expect(el.textContent.trim(), 'else-if').to.be.eq('else-if');

        el.condition = 'else';
        updateElement(factory(funclate), el);
        expect(el.textContent.trim(), 'else').to.be.eq('else');
    });

    it('should manage no condition', () => {
        const html = `
            <fc-if>
                if
            <fc-else-if/>
                else-if
            <fc-else/>
                else
            </fc-if>
        `;
        const factory = <Function> parse(html, {pretty: true});
        updateElement(factory(funclate), el);
        expect(el.textContent.trim(), 'else').to.be.eq('else');
    });

});
