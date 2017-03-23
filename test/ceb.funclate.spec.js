/*jshint -W030 */
import {spy} from "sinon";
import {
    fcCloseElement,
    fcComment,
    fcContent,
    fcOpenElement,
    fcOpenVoidElement,
    fcText,
    updateElement
} from "../src/funclate";


describe('ceb.funclate()', () => {
    let sandbox;
    beforeEach(() => {
        if (sandbox) {
            sandbox.parentNode.removeChild(sandbox);
        }
        sandbox = document.body.appendChild(document.createElement('div'));
    });

    afterEach(() => {
        //sandbox.innerHTML = '';
    });

    it('should render a very simple template', () => {
        const render = () => {
            fcText('before');
            fcOpenElement('strong', {class: 'foo'}, {key1: 'value1'});
            fcComment('the tag name');
            fcText('foo');
            fcCloseElement();
            fcOpenVoidElement('input', {type: 'number'});
            fcText('after');
        };
        const el = sandbox.appendChild(document.createElement('div'));
        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`before<strong class="foo"><!--the tag name-->foo</strong><input type="number">after`);
        expect(el.querySelector('strong').key1).to.be.eq('value1');
    });

    it('should render a simple template', () => {
        const render = el => {
            fcOpenElement('p');
            fcText('before');

            if (el.foo) {
                fcOpenElement('strong');
                fcComment('the tag name');
                if (el.bar) {
                    fcText(el.bar);
                }
                fcCloseElement();
            }

            fcText('between');

            if (el.bar) {
                fcOpenElement('em');
                if (el.foo) {
                    fcText(el.foo);
                }
                fcCloseElement();
            }

            fcText('after');

            if (!el.foo) {
                fcText('!');
            }
            fcCloseElement();
        };
        const el = sandbox.appendChild(document.createElement('div'));

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
            fcOpenElement('p');
            fcText('before');
            if (el.foo) {
                fcText(el.foo);
            }
            fcContent();
            fcText('after');
            fcCloseElement();
        };
        const el = sandbox.appendChild(document.createElement('div'));

        el.innerHTML = `<strong>foo</strong>`;

        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<p>before<fc-content><strong>foo</strong></fc-content>after</p>`);

        el.foo = 'bar';
        updateElement(el, render);
        expect(el.innerHTML, '2').to.be.eq(`<p>beforebar<fc-content><strong>foo</strong></fc-content>after</p>`);
    });

    it('should manage light dom with content option', () => {
        const render = el => {
            fcOpenElement('p');
            fcText('before');
            if (el.foo) {
                fcText(el.foo);
            }
            fcOpenElement('div', {}, {}, {content: true});
            fcCloseElement();
            fcText('after');
            fcCloseElement();
        };
        const el = sandbox.appendChild(document.createElement('div'));

        el.innerHTML = `<strong>foo</strong>`;

        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<p>before<div><strong>foo</strong></div>after</p>`);

        el.foo = 'bar';
        updateElement(el, render);
        expect(el.innerHTML, '2').to.be.eq(`<p>beforebar<div><strong>foo</strong></div>after</p>`);
    });

    it('should manage sub light dom', () => {
        const render1 = el => {
            fcText('before1');
            if (el.foo) {
                fcText('foo');
            }
            fcContent();
            fcText('after1');
        };
        const render2 = el => {
            fcText('before2');
            fcContent();
            if (el.bar) {
                fcText('bar');
            }
            fcText('after2');
        };
        const el = sandbox.appendChild(document.createElement('div'));
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
        let sypiedCreateElement = spy(document, 'createElement');
        const render = () => {
            fcOpenElement('button', {is: 'my-button'});
            fcCloseElement();
        };
        const el = sandbox.appendChild(document.createElement('div'));
        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<button is="my-button"></button>`);
        expect(sypiedCreateElement, '1 createElementStub').to.have.been.calledWith('button', 'my-button');
        sypiedCreateElement.restore();
    });

    it('should create void element', () => {
        const render = () => {
            fcOpenVoidElement('input', {type: 'text'}, {value: 'foo'}, {});
            fcOpenVoidElement('br');
        };
        const el = sandbox.appendChild(document.createElement('div'));
        updateElement(el, render);
        expect(el.innerHTML, '1').to.be.eq(`<input type="text"><br>`);
        expect(el.querySelector('input').value, '1').to.be.eq('foo');
    });

    xit('should manage identified nodes', () => {
        const items = [];
        for (let i = 0; i < 5; i++) {
            items.push({id: 'item-' + i, value: i});
        }

        const render = () => {
            items.forEach(item => {
                fcOpenElement('li', null, null, {key: item.id});
                fcText(item.id + ': ');
                if (item.value % 2) {
                    fcText('even');
                } else {
                    fcText('odd');
                }
                fcCloseElement();
            });
        };
        const el = sandbox.appendChild(document.createElement('div'));

        const initialLiList = {};
        updateElement(el, render);
        el.querySelectorAll('li').forEach((li, i) => {
            const id = li.dataset.fcKey;
            console.log(id, li);
            initialLiList[id] = li;
            expect(id, 'initial ' + id).to.be.eq('item-' + i);
        });
        console.log('--------------', initialLiList);
        items.reverse();
        updateElement(el, render);
        el.querySelectorAll('li').forEach(li => {
            const id = li.dataset.fcKey;
            const initialLi = initialLiList[id];
            console.log(id, li, initialLi);
            expect(li, 'reverse ' + id).to.be.eq(initialLi);
        });

        // expect(el.innerHTML, '1').to.be.eq(`<fc-content></fc-content>`);

    });

});
