import parse5 from "parse5";
import stream from "stream";

function assign() {
    return Array.prototype.reduce.call(arguments, function (target, source) {
        return Object.keys(Object(source)).reduce((target, key) => {
            target[key] = source[key];
            return target;
        }, target);
    });
}

class Statements {
    constructor(options) {
        this.options = options;
        this.statements = [];
    }

    append(statement) {
        this.statements.push(statement);
        return this;
    }

    join(separator) {
        if (separator) {
            return this.statements.join(separator);
        }
        return this.statements.join(this.options.pretty ? '\n' : '');
    }

    static get(options) {
        return new Statements(options);
    }
}

const DEFAULT_OPTIONS = {
    pretty: false,
    interpolation: /\{\{([\s\S]+?)}}/gm
};

class Factory {

    constructor(options) {
        this.options = options;
        this.render = Statements.get(this.options).append(`var ${options.elVarName || 'el'} = __el__;`);
    }

    appendOpenElement(name, attrs, props, opts) {
        this.render.append(`fcOpenElement('${name}', ${attrs}, ${props}, ${opts});`);
    }

    appendCloseElement() {
        this.render.append(`fcCloseElement();`);
    }

    appendVoidElement(name, attrs, props, opts) {
        this.render.append(`fcVoidElement('${name}', ${attrs}, ${props}, ${opts});`);
    }

    appendText(text) {
        this.render.append(`fcText(${text});`);
    }

    appendComment(text) {
        this.render.append(`fcComment('${text}');`);
    }

    toFunction() {
        const wrapper = Statements.get(this.options)
            .append('var fcOpenElement = funclate.openElement;')
            .append('var fcCloseElement = funclate.closeElement;')
            .append('var fcVoidElement = funclate.voidElement;')
            .append('var fcContent = funclate.content;')
            .append('var fcText = funclate.text;')
            .append('var fcComment = funclate.comment;')
            .append('return function (__el__) {')
            .append(this.render.join())
            .append('}')
            .join();
        console.log('wrapper', this.render.join());
        return new Function('funclate', wrapper);
    }
}

function interpolate(value, options) {
    let result;
    let statements = [];
    let lastIndex = 0;
    while ((result = options.interpolation.exec(value)) !== null) {
        let full = result[0];
        let group = result[1];
        let index = result.index;
        let before = value.substring(lastIndex, index);
        if (before) {
            statements.push(`'${before}'`);
        }
        if (group.trim()) {
            statements.push(group.trim());
        }
        lastIndex = index + full.length;
    }
    let after = value.substring(lastIndex, value.length);
    if (after) {
        statements.push(`'${after}'`);
    }
    return statements.join(' + ');
}

export function parse(html = '', options, callback) {
    options = assign(DEFAULT_OPTIONS, options);
    const s = new stream.Readable();
    s.push(html);
    s.push(null);

    const parser = new parse5.SAXParser();
    const factory = new Factory(options);

    parser.on('startTag', (name, attrs, selfClosing) => {
        console.log('startTag', name, attrs, selfClosing);

        const fcAttrs = Statements.get(options);
        const fcProps = Statements.get(options);
        attrs.forEach(attr => {
            let index = attr.name.indexOf('@');
            console.log(attr, index);
            if (index === 0 || index === 5) {
                fcProps.append(`'${attr.name}', ${interpolate(attr.value, options)}`);
            } else {
                fcAttrs.append(`'${attr.name}', ${interpolate(attr.value, options)}`);
            }
        });

        console.log();
        if (selfClosing) {
            factory.appendVoidElement(name, `[${fcAttrs.join(',')}]`, `[${fcProps.join(',')}]`);
        } else {
            factory.appendOpenElement(name, `[${fcAttrs.join(',')}]`, `[${fcProps.join(',')}]`);
        }
    });

    parser.on('endTag', name => {
        console.log('endTag', name);
        factory.appendCloseElement();
    });

    parser.on('comment', text => {
        console.log('comment', text);
        factory.appendComment(text);
    });

    parser.on('text', text => {
        console.log('text', text);
        factory.appendText(interpolate(text, options));
    });

    parser.on('string', string => {
        console.log('string', string)
    });

    return s.pipe(parser).on('end', err => {
        console.log('result', err);
        if (err) {
            callback(err);
        } else {
            // console.info('body', factory.toFunction().toString());
            callback(undefined, factory.toFunction());
        }
    });
}
