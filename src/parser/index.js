import parse5 from 'parse5';
import stream from 'stream';
import {FcEachTag} from './FcEachTag';
import {FcIfTag} from './FcIfTag';
import {FcElseTag} from './FcElseTag';
import {FcElseIfTag} from './FcElseIfTag';
import {Statements} from './Statements';
import {Factory} from './Factory';
import {assign, interpolate} from './utils';

const tags = {
    'fc-each': new FcEachTag(),
    'fc-if': new FcIfTag(),
    'fc-else': new FcElseTag(),
    'fc-else-if': new FcElseIfTag()
};

const DEFAULT_OPTIONS = {
    output: 'function',
    pretty: false,
    interpolation: /\{\{([\s\S]+?)}}/gm,
    property: '#',
    selfClosingElements: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
    tags: tags
};

export function parse(html, options, callback) {
    options = assign({}, DEFAULT_OPTIONS, options);
    const s = new stream.Readable();
    s.push(html);
    s.push(null);

    const parser = new parse5.SAXParser();
    const factory = new Factory(options);

    parser.on('startTag', (name, attrs, selfClosing) => {
        if (options.tags[name]) {
            const attributes = attrs.reduce((m, a) => {
                m[a.name] = a;
                return m;
            }, {});
            options.tags[name].startTag(factory, name, attributes, selfClosing);
        } else {
            const fcAttrs = Statements.get(options);
            const fcProps = Statements.get(options);
            attrs.forEach(attr => {
                const index = attr.name.indexOf(options.property);
                let name = attr.name;
                let destination = fcAttrs;
                if (index > -1) {
                    name = attr.name.substring(index + 1);
                    destination = fcProps;
                }
                destination.append(`'${name}', ${interpolate(attr.value, options)}`);
            });
            if (selfClosing || options.selfClosingElements.indexOf(name) > -1) {
                factory.appendVoidElement(name, `[${fcAttrs.join(',')}]`, `[${fcProps.join(',')}]`);
            } else {
                factory.appendOpenElement(name, `[${fcAttrs.join(',')}]`, `[${fcProps.join(',')}]`);
            }
        }
    });

    parser.on('endTag', name => {
        if (options.tags[name]) {
            options.tags[name].endTag(factory, name);
        } else {
            factory.appendCloseElement();
        }
    });

    parser.on('comment', text => {
        factory.appendComment(interpolate(text, options));
    });

    parser.on('text', text => {
        factory.appendText(interpolate(text, options));
    });

    return s.pipe(parser).on('end', err => {
        if (err) {
            callback(err);
        } else {
            callback(undefined, factory.toFunction());
        }
    });
}
