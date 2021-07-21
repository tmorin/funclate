import {expect} from 'chai';
import {parse} from '../../src/parser';
import * as funclate from '../../src/runtime';
import {updateElement} from '../../src/runtime';
import {JSDOM} from "jsdom";

describe('FcEach', () => {
    let document;
    let el;
    beforeEach(() => {
        const dom = new JSDOM(`<!DOCTYPE html>`);
        document = dom.window.document;
        if (el) {
            el.parentNode.removeChild(el);
        }
        el = document.body.appendChild(document.createElement('div'));
    });

    afterEach(() => {
        el.innerHTML = '';
    });

    it('should iterate', () => {
        const html = `<fc-each fc-items="el.items"><div id="{{ item }}">{{ item }}</div></fc-each>`;
        const factory = <Function> parse(html, {pretty: true});
        el.items = [1, 2, 3, 4, 5];
        updateElement(factory(funclate), el);
        expect(el.querySelectorAll('div').length, '1').to.be.eq(5);
    });

    it('should iterate override item variable name', () => {
        const html = `
            <fc-each fc-items="el.items" fc-item="row">
                <div id="{{ row }}" data-i="{{ index }}">{{ row }}</div>
            </fc-each>
        `;
        const factory = <Function> parse(html, {pretty: true});
        el.items = [1, 2, 3, 4, 5];
        updateElement(factory(funclate), el);
        expect(el.querySelector('div').getAttribute('id'), 'id').to.be.eq('1');
        expect(el.querySelector('div').dataset.i, 'i').to.be.eq('0');
    });

    it('should iterate override index variable name', () => {
        const html = `
            <fc-each fc-items="el.items" fc-index="i">
                <div id="{{ item }}" data-i="{{ i }}">{{ item }}</div>
            </fc-each>
        `;
        const factory = <Function> parse(html, {pretty: true});
        el.items = [1, 2, 3, 4, 5];
        updateElement(factory(funclate), el);
        expect(el.querySelector('div').getAttribute('id'), 'id').to.be.eq('1');
        expect(el.querySelector('div').dataset.i, 'i').to.be.eq('0');
    });

    it('should iterate override all variable name', () => {
        const html = `
            <fc-each fc-items="el.items" fc-all="a">
                <div id="{{ item }}" #a="{{ a }}">{{ item }}</div>
            </fc-each>
        `;
        const factory = <Function> parse(html, {pretty: true});
        el.items = [1, 2, 3, 4, 5];
        updateElement(factory(funclate), el);
        expect(el.querySelector('div').getAttribute('id'), 'id').to.be.eq('1');
        expect(el.querySelector('div').a, 'a').to.be.eq(el.items);
    });

    it('should be compliant with none existing items', () => {
        const html = `
            <fc-each>
                <div id="{{ item }}" data-i="{{ index }}">{{ item }}</div>
            </fc-each>
        `;
        const factory = <Function> parse(html, {pretty: true});
        updateElement(factory(funclate), el);
        expect(el.querySelectorAll('div').length, 'length').to.be.eq(0);
    });

});
