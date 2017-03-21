/*jshint -W030 */
import {fcOpenElement, fcCloseElement, fcText, fcContent, fcComment, fcOpenVoidElement} from '../src/funclate';

describe('ceb.funclate()', () => {
    let sandbox;
    beforeEach(() => {
        if (sandbox) {
            sandbox.parentNode.removeChild(sandbox);
        }
        sandbox = document.body.appendChild(document.createElement('div'));
    });

    afterEach(() => {
        sandbox.innerHTML = '';
    });

    it('should work', () => {

    });

    xit('should render a very simple template', () => {
        builder.builders(
            funclate(el => {
                fcText('before');
                fcOpenElement('strong', {class: 'foo'}, {key1: 'value1'});
                fcComment('the tag name');
                fcText('foo');
                fcCloseElement();
                fcOpenVoidElement('input', {type: 'number'});
                fcText('after');
            })
        ).register('ceb-funclate-very-simple');
        let el = sandbox.appendChild(document.createElement('ceb-funclate-very-simple'));
        expect(el.innerHTML, 'init').to.be.eq(`before<strong class="foo"><!--the tag name-->foo</strong><input type="number">after`);
        expect(el.querySelector('strong').key1).to.be.eq('value1');
    });

    xit('should render a simple template', done => {
        builder.builders(
            funclate(el => {
                fcOpenElement('p');
                fcText('before');
                fcOpenElement('strong');
                fcComment('the tag name');
                if (el.foo) {
                    fcText(el.foo);
                }
                fcCloseElement();
                fcText('after');
                fcCloseElement();
            }),
            attribute('foo').listen(el => el.render())
        ).register('ceb-funclate-simple');
        let el = sandbox.appendChild(document.createElement('ceb-funclate-simple'));
        expect(el.innerHTML, 'init').to.be.eq(`<p>before<strong><!--the tag name--></strong>after</p>`);
        el.foo = 'bar';
        setTimeout(() => {
            expect(el.innerHTML, 'first').to.be.eq(`<p>before<strong><!--the tag name-->bar</strong>after</p>`);
            el.foo = '';
            setTimeout(() => {
                expect(el.innerHTML, 'second').to.be.eq(`<p>before<strong><!--the tag name--></strong>after</p>`);
                done();
            }, 20);
        }, 20);
    });

    xit('should manage light dom', done => {
        builder.builders(
            funclate(() => {
                fcOpenElement('p');
                fcText('before');
                fcContent();
                fcText('after');
                fcCloseElement();
            }),
            attribute('foo').listen(el => el.render())
        ).register('ceb-funclate-ld');
        sandbox.innerHTML = `<ceb-funclate-ld><em>light dom</em></ceb-funclate-ld>`;
        setTimeout(() => {
            const el = sandbox.querySelector('ceb-funclate-ld');
            expect(el.innerHTML, 'init').to.be.eq(`<p>before<ceb-content><em>light dom</em></ceb-content>after</p>`);
            done();
        }, 20);
    });

    xit('should manage sub light dom', done => {
        element().builders(
            funclate(() => {
                fcText('before1');
                fcContent();
                fcText('after1');
            })
        ).register('ceb-funclate-sub-ld-1');

        element().builders(
            funclate(() => {
                fcText('before2');
                fcOpenElement('ceb-funclate-sub-ld-1', {}, {}, {content: true});
                fcCloseElement();
                fcText('after2');
            })
        ).register('ceb-funclate-sub-ld-2');

        sandbox.innerHTML = `<ceb-funclate-sub-ld-2><em>light dom</em></ceb-funclate-sub-ld-2>`;
        setTimeout(() => {
            const el = sandbox.querySelector('ceb-funclate-sub-ld-2');
            expect(el.innerHTML, 'init').to.be.eq(`before2<ceb-funclate-sub-ld-1>before1<ceb-content><em>light dom</em></ceb-content>after1</ceb-funclate-sub-ld-1>after2`);
            done();
        }, 20);
    });

    xit('should replace element', done => {
        builder.builders(
            funclate(el => {
                if (el.value) {
                    fcOpenVoidElement('input', {value: el.value});
                } else {
                    fcOpenElement('em');
                    fcText('no value');
                    fcCloseElement();
                }
            }),
            attribute('value').listen(el => el.render())
        ).register('ceb-funclate-replace-element');
        let el = sandbox.appendChild(document.createElement('ceb-funclate-replace-element'));
        expect(el.innerHTML, 'init').to.be.eq(`<em>no value</em>`);
        el.value = 'foo';
        setTimeout(() => {
            expect(el.innerHTML, 'after update').to.be.eq(`<input value="foo">`);
            done();
        }, 20);
    });

    xit('should manage custom element extended native one', done => {
        builder.base(Object.create(HTMLButtonElement.prototype), 'button').builders(
            attribute('test')
        ).register('ceb-funclate-extended-button');
        element().builders(
            funclate(() => {
                fcOpenElement('button', {is: 'ceb-funclate-extended-button'}, {}, {content: true});
                fcCloseElement();
            })
        ).register('ceb-funclate-extended-container');
        sandbox.innerHTML = `<ceb-funclate-extended-container>foo bar</ceb-funclate-extended-container>`;
        setTimeout(() => {
            let el = sandbox.querySelector('ceb-funclate-extended-container');
            expect(el.innerHTML, 'init').to.be.eq(`<button is="ceb-funclate-extended-button">foo bar</button>`);
            done();
        }, 20);
    });

});
