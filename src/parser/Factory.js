import {Statements} from './Statements';

export class Factory {

    constructor(options) {
        this.options = options;
        this.render = Statements.get(this.options)
            .append(`var ${options.elVarName || 'el'} = __el__;`);
        this.wrapper = Statements.get(this.options)
            .append('var fcOpenElement = funclate.openElement;')
            .append('var fcCloseElement = funclate.closeElement;')
            .append('var fcVoidElement = funclate.voidElement;')
            .append('var fcContent = funclate.content;')
            .append('var fcText = funclate.text;')
            .append('var fcComment = funclate.comment;');
    }

    appendOpenElement(name, attrs, props, opts) {
        this.render.append(`fcOpenElement('${name}', ${attrs}, ${props}, ${opts});`);
        return this;
    }

    appendCloseElement() {
        this.render.append(`fcCloseElement();`);
        return this;
    }

    appendVoidElement(name, attrs, props, opts) {
        this.render.append(`fcVoidElement('${name}', ${attrs}, ${props}, ${opts});`);
        return this;
    }

    appendText(text) {
        this.render.append(`fcText(${text});`);
        return this;
    }

    appendComment(text) {
        this.render.append(`fcComment(${text});`);
        return this;
    }

    append(statement) {
        this.render.append(statement);
        return this;
    }

    toFunction() {
        const wrapper = this.wrapper
            .append('return function (__el__) {')
            .append(this.render.join()).append('}')
            .join();
        if (this.options.output === 'string') {
            return `function (funclate) {${wrapper}}`;
        }
        return new Function('funclate', wrapper);
    }
}
