/*jshint -W030 */
import {parse} from '../../src/parser';
import * as funclate from '../../src/runtime';
import {updateElement} from '../../src/runtime';

describe('FcEach', () => {
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

    it('should iterate', done => {
        const html = `<fc-each fc-items="el.items"><div id="{{ item }}">{{ item }}</div></fc-each>`;
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.items = [1, 2, 3, 4, 5];
            updateElement(el, factory(funclate));
            expect(el.querySelectorAll('div').length, '1').to.be.eq(5);

            done();
        });
    });

    it('should iterate override item variable name', done => {
        const html = `
            <fc-each fc-items="el.items" fc-item="row">
                <div id="{{ row }}" data-i="{{ index }}">{{ row }}</div>
            </fc-each>
        `;
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.items = [1, 2, 3, 4, 5];
            updateElement(el, factory(funclate));
            expect(el.querySelector('div').getAttribute('id'), 'id').to.be.eq('1');
            expect(el.querySelector('div').dataset.i, 'i').to.be.eq('0');

            done();
        });
    });

    it('should iterate override index variable name', done => {
        const html = `
            <fc-each fc-items="el.items" fc-index="i">
                <div id="{{ item }}" data-i="{{ i }}">{{ item }}</div>
            </fc-each>
        `;
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.items = [1, 2, 3, 4, 5];
            updateElement(el, factory(funclate));
            expect(el.querySelector('div').getAttribute('id'), 'id').to.be.eq('1');
            expect(el.querySelector('div').dataset.i, 'i').to.be.eq('0');

            done();
        });
    });

    it('should iterate override all variable name', done => {
        const html = `
            <fc-each fc-items="el.items" fc-all="a">
                <div id="{{ item }}" #a="{{ a }}">{{ item }}</div>
            </fc-each>
        `;
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            el.items = [1, 2, 3, 4, 5];
            updateElement(el, factory(funclate));
            expect(el.querySelector('div').getAttribute('id'), 'id').to.be.eq('1');
            expect(el.querySelector('div').a, 'a').to.be.eq(el.items);

            done();
        });
    });

    it('should be compliant with none existing items', done => {
        const html = `
            <fc-each>
                <div id="{{ item }}" data-i="{{ index }}">{{ item }}</div>
            </fc-each>
        `;
        parse(html, {pretty: true}, (err, factory) => {
            if (err) {
                return done(err);
            }

            updateElement(el, factory(funclate));
            expect(el.querySelectorAll('div').length, 'length').to.be.eq(0);

            done();
        });
    });

});
