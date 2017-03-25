/*jshint -W030 */
import {spy} from 'sinon';
import {closeElement, comment, content, openElement, text, updateElement, voidElement} from '../../src/runtime';

const toArray = v => Array.prototype.slice.call(v);

describe('updateElement()', () => {
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

    it('should render a very simple template', () => {
        const render = () => {
            text('before');
            openElement('strong', ['class', 'foo'], ['key1', 'value1']);
            comment('the tag name');
            text('foo');
            closeElement();
            voidElement('input', ['type', 'number']);
            text('after');
        };
        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`before<strong class="foo"><!--the tag name-->foo</strong><input type="number">after`);
        expect(el.querySelector('strong').key1).to.be.eq('value1');
    });

    it('should render a simple template', () => {
        const render = el => {
            openElement('p');
            text('before');

            if (el.foo) {
                openElement('strong');
                comment('the tag name');
                if (el.bar) {
                    text(el.bar);
                }
                closeElement();
            }

            text('between');

            if (el.bar) {
                openElement('em');
                if (el.foo) {
                    text(el.foo);
                }
                closeElement();
            }

            text('after');

            if (!el.foo) {
                text('!');
            }
            closeElement();
        };

        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<p>beforebetweenafter!</p>`);

        const p = el.querySelector('p');

        el.foo = 'foo';
        updateElement(el, render);
        expect(el.innerHTML, '2').to.be.eq(`<p>before<strong><!--the tag name--></strong>betweenafter</p>`);
        expect(p, '2 p').to.be.eq(el.querySelector('p'));

        const strong = el.querySelector('strong');

        el.bar = 'bar';
        updateElement(el, render);
        expect(el.innerHTML, '3').to.be.eq(`<p>before<strong><!--the tag name-->bar</strong>between<em>foo</em>after</p>`);
        expect(p, '3 p').to.be.eq(el.querySelector('p'));
        expect(strong, '3 strong').to.be.eq(el.querySelector('strong'));

        el.bar = null;
        updateElement(el, render);
        expect(el.innerHTML, '4').to.be.eq(`<p>before<strong><!--the tag name--></strong>betweenafter</p>`);
        expect(p, '4 p').to.be.eq(el.querySelector('p'));
        expect(strong, '4 strong').to.be.eq(el.querySelector('strong'));

        el.foo = null;
        el.bar = 'bar';
        updateElement(el, render);
        expect(el.innerHTML, '5').to.be.eq(`<p>beforebetween<em></em>after!</p>`);
        expect(p, '5 p').to.be.eq(el.querySelector('p'));
    });

    it('should manage light dom with fc-content element', () => {
        const render = el => {
            openElement('p');
            text('before');
            if (el.foo) {
                text(el.foo);
            }
            content();
            text('after');
            closeElement();
        };

        el.innerHTML = `<strong>foo</strong>`;

        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<p>before<fc-content><strong>foo</strong></fc-content>after</p>`);

        el.foo = 'bar';
        updateElement(el, render);
        expect(el.innerHTML, '2').to.be.eq(`<p>beforebar<fc-content><strong>foo</strong></fc-content>after</p>`);
    });

    it('should manage light dom with content option', () => {
        const render = el => {
            openElement('p');
            text('before');
            if (el.foo) {
                text(el.foo);
            }
            openElement('blockquote', null, null, ['content', true]);
            closeElement();
            text('after');
            closeElement();
        };

        el.innerHTML = `<strong>foo</strong>`;

        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<p>before<blockquote><strong>foo</strong></blockquote>after</p>`);

        el.foo = 'bar';
        updateElement(el, render);
        expect(el.innerHTML, '2').to.be.eq(`<p>beforebar<blockquote><strong>foo</strong></blockquote>after</p>`);
    });

    it('should manage sub light dom', () => {
        const render1 = el => {
            text('before1');
            if (el.foo) {
                text('foo');
            }
            content();
            text('after1');
        };
        const render2 = el => {
            text('before2');
            content();
            if (el.bar) {
                text('bar');
            }
            text('after2');
        };
        const div = el.appendChild(document.createElement('div'));
        div.textContent = 'foo';

        updateElement(el, render1);
        expect(el.innerHTML, '1').to.be.eq(`before1<fc-content><div>foo</div></fc-content>after1`);

        updateElement(div, render2);
        expect(el.innerHTML, '2').to.be.eq(`before1<fc-content><div>before2<fc-content>foo</fc-content>after2</div></fc-content>after1`);

        el.foo = 'foo';
        updateElement(el, render1);
        updateElement(div, render2);
        expect(el.innerHTML, '3').to.be.eq(`before1foo<fc-content><div>before2<fc-content>foo</fc-content>after2</div></fc-content>after1`);

        div.bar = 'bar';
        updateElement(el, render1);
        updateElement(div, render2);
        expect(el.innerHTML, '4').to.be.eq(`before1foo<fc-content><div>before2<fc-content>foo</fc-content>barafter2</div></fc-content>after1`);

        el.foo = null;
        div.bar = null;
        updateElement(el, render1);
        updateElement(div, render2);
        expect(el.innerHTML, '5').to.be.eq(`before1<fc-content><div>before2<fc-content>foo</fc-content>after2</div></fc-content>after1`);
    });

    it('should create custom element', () => {
        const render = () => {
            openElement('button', ['is', 'my-button']);
            closeElement();
        };
        let spiedCreateElement = spy(el.ownerDocument, 'createElement');
        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<button is="my-button"></button>`);
        expect(spiedCreateElement, '1 createElementStub').to.have.been.calledWith('button', 'my-button');
        spiedCreateElement.restore();
    });

    it('should create void element', () => {
        const render = () => {
            voidElement('input', ['type', 'text'], ['value', 'foo']);
            voidElement('br');
        };

        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<input type="text"><br>`);
        expect(el.querySelector('input').value, '1').to.be.eq('foo');
    });

    it('should create empty node', () => {
        const render = () => {
            text();
            comment();
        };

        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<!---->`);
        expect(el.childNodes.length, '1').to.be.eq(2);
    });

    it('should remove unvisited elements', () => {
        const render1 = () => {
            openElement('p');
            closeElement();
        };
        const render2 = () => {
        };

        updateElement(el, render1);
        expect(el.innerHTML, '1').to.be.eq(`<p></p>`);

        updateElement(el, render2);
        expect(el.innerHTML, '1').to.be.eq(``);
    });

    it('should manage identified element', () => {
        const items = [];
        for (let i = 0; i < 6; i++) {
            items.push({id: 'item-' + i, value: i});
        }

        const render = () => {
            items.forEach(item => {
                openElement('li', null, null, ['key', item.id]);
                text(item.id + ': ');
                if (item.value % 2) {
                    text('even');
                } else {
                    text('odd');
                }
                closeElement();
            });
        };

        const initialLiList = {};
        updateElement(el, render);

        toArray(el.querySelectorAll('li')).forEach((li, i) => {
            const id = li.dataset.fcKey;
            initialLiList[id] = li;
            expect(id, 'initial ' + id).to.be.eq('item-' + i);
        });

        items.shift();
        items.pop();
        items.reverse();
        updateElement(el, render);
        expect(el.querySelectorAll('li').length, 'count').to.be.eq(Object.keys(initialLiList).length - 2);
        toArray(el.querySelectorAll('li')).forEach(li => {
            const id = li.dataset.fcKey;
            const initialLi = initialLiList[id];
            expect(li, 'reverse ' + id).to.be.eq(initialLi);
        });
    });

    it('should override add/update attributes removing others', () => {
        const render1 = () => {
            openElement('p', ['att1', 'value1', 'att3', true, 'att4', 0, 'att6', 'value6']);
            closeElement();
        };
        const render2 = () => {
            openElement('p', ['att2', 'value2', 'att3', false, 'att5', 1, 'att6', '']);
            closeElement();
        };
        const render3 = () => {
            openElement('p');
            closeElement();
        };

        updateElement(el, render1);
        expect(el.innerHTML, '1').to.be.eq('<p att1="value1" att3="" att4="0" att6="value6"></p>');

        updateElement(el, render2);
        expect(el.innerHTML, '2').to.be.eq('<p att2="value2" att5="1"></p>');

        updateElement(el, render3);
        expect(el.innerHTML, '3').to.be.eq('<p></p>');
    });

    it('should override add/update properties removing others', () => {
        const render1 = () => {
            openElement('p', null, ['prop1', 'val1']);
            closeElement();
        };
        const render2 = () => {
            openElement('p', null, []);
            closeElement();
        };

        updateElement(el, render1);
        let p = el.querySelector('p');
        expect(p.prop1, '1').to.be.eq('val1');

        updateElement(el, render2);
        expect(p.prop1, '2').to.be.eq(undefined);
    });

});
