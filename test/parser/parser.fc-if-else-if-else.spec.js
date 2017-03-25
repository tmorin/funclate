/*jshint -W030 */
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

    it('should manage boolean condition', done => {
        const html = `
            <fc-if fc-condition="el.condition === 'if'">
                if
            <fc-else-if fc-condition="el.condition === 'else-if'"/>
                else-if
            <fc-else/>
                else
            </fc-if>
        `;
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.condition = 'if';
            updateElement(el, factory(funclate));
            expect(el.textContent.trim(), 'if').to.be.eq('if');

            el.condition = 'else-if';
            updateElement(el, factory(funclate));
            expect(el.textContent.trim(), 'else-if').to.be.eq('else-if');

            el.condition = 'else';
            updateElement(el, factory(funclate));
            expect(el.textContent.trim(), 'else').to.be.eq('else');

            done();
        });
    });

    it('should manage no condition', done => {
        const html = `
            <fc-if>
                if
            <fc-else-if/>
                else-if
            <fc-else/>
                else
            </fc-if>
        `;
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            updateElement(el, factory(funclate));
            expect(el.textContent.trim(), 'else').to.be.eq('else');

            done();
        });
    });

});
