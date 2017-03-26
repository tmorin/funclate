import htmlparser2 from 'htmlparser2';
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

export function parse(html, options) {
    options = assign({}, DEFAULT_OPTIONS, options);
    const s = new stream.Readable();
    s.push(html);
    s.push(null);

    const factory = new Factory(options);
    const p = new htmlparser2.Parser({
        onopentag(name, attrs, selfClosing) {
            if (options.tags[name]) {
                options.tags[name].startTag(factory, name, attrs, selfClosing);
            } else {
                const fcAttrs = Statements.get(options);
                const fcProps = Statements.get(options);
                Object.keys(attrs).forEach(attName => {
                    const index = attName.indexOf(options.property);
                    let name = attName;
                    let destination = fcAttrs;
                    if (index > -1) {
                        name = attName.substring(index + 1);
                        destination = fcProps;
                    }
                    destination.append(`'${name}', ${interpolate(attrs[attName], options)}`);
                });
                if (options.selfClosingElements.indexOf(name) > -1) {
                    factory.appendVoidElement(name, `[${fcAttrs.join(',')}]`, `[${fcProps.join(',')}]`);
                } else {
                    factory.appendOpenElement(name, `[${fcAttrs.join(',')}]`, `[${fcProps.join(',')}]`);
                }
            }
        },
        onclosetag(name, toto) {
            if (options.tags[name]) {
                options.tags[name].endTag(factory, name);
            } else if (options.selfClosingElements.indexOf(name) < 0) {
                factory.appendCloseElement();
            }
        },
        ontext(text){
            factory.appendText(interpolate(text, options));
        },
        oncomment(text){
            factory.appendComment(interpolate(text, options));
        }
    }, {
        xmlMode: false,
        decodeEntities: false,
        lowerCaseTags: true,
        lowerCaseAttributeNames: true,
        recognizeSelfClosing: true,
        recognizeCDATA: true
    });

    p.parseComplete(html);
    return factory.toFunction();
}
