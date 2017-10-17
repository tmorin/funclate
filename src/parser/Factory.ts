import {ParserOptions, RenderFactory} from './model';
import {Statements} from './Statements';

export class Factory {

    private options: { [k: string]: any };

    private render: Statements;

    private wrapper: Statements;

    constructor(options: ParserOptions) {
        this.options = options;

        this.render = Statements.get(this.options)
            .append(`var ${options.elVarName || 'el'} = __el__;`)
            .append(`var ${options.ctxVarName || 'ctx'} = __ctx__;`);

        this.wrapper = Statements.get(this.options)
            .append('var fcOpenElement = funclate.openElement;')
            .append('var fcCloseElement = funclate.closeElement;')
            .append('var fcVoidElement = funclate.voidElement;')
            .append('var fcContent = funclate.content;')
            .append('var fcText = funclate.text;')
            .append('var fcComment = funclate.comment;');
    }

    public appendOpenElement(name: string, attrs: string, props: string, opts: string) {
        this.render.append(`fcOpenElement('${name}', ${attrs}, ${props}, ${opts});`);
        return this;
    }

    public appendCloseElement() {
        this.render.append(`fcCloseElement();`);
        return this;
    }

    public appendVoidElement(name: string, attrs: string, props: string, opts: string) {
        this.render.append(`fcVoidElement('${name}', ${attrs}, ${props}, ${opts});`);
        return this;
    }

    public appendText(text: string) {
        this.render.append(`fcText(${text});`);
        return this;
    }

    public appendComment(text: string) {
        this.render.append(`fcComment(${text});`);
        return this;
    }

    public appendContent() {
        this.render.append(`fcContent();`);
        return this;
    }

    public append(statement: string) {
        this.render.append(statement);
        return this;
    }

    public toFunction(): RenderFactory | string {
        const wrapper = this.wrapper
            .append('return function (__el__, __ctx__) {')
            .append(this.render.join()).append('}')
            .join();
        if (this.options.output === 'string') {
            return `function (funclate) {${wrapper}}`;
        }
        return new Function('funclate', wrapper) as RenderFactory;
    }
}
