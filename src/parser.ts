import {Parser} from 'htmlparser2';
import {Factory} from './parser/Factory';
import {FcCallTag} from './parser/FcCallTag';
import {FcContentTag} from './parser/FcContentTag';
import {FcEachTag} from './parser/FcEachTag';
import {FcElseIfTag} from './parser/FcElseIfTag';
import {FcElseTag} from './parser/FcElseTag';
import {FcIfTag} from './parser/FcIfTag';
import {ParserOptions, RenderFactory, Tags} from './parser/model';
import {Statements} from './parser/Statements';
import {assign, interpolate, toCamelCase} from './parser/utils';

const TAGS: Tags = {
    'fc-each': new FcEachTag(),
    'fc-if': new FcIfTag(),
    'fc-else': new FcElseTag(),
    'fc-else-if': new FcElseIfTag(),
    'fc-content': new FcContentTag(),
    'fc-call': new FcCallTag()
};

const DEFAULT_OPTIONS: ParserOptions = {
    output: 'function',
    pretty: false,
    interpolation: /\{\{([\s\S]+?)\}\}/gm,
    propNamePrefix: '#',
    elVarName: 'el',
    ctxVarName: 'ctx',
    selfClosingElements: [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
    ],
    tags: TAGS
};

/**
 * Parse an HTML template and return the factory of the underlying render function.
 * @param html the HTML content to parse
 * @param [options] the options
 * @return the factory function as Function or string.
 */
export function parse(html: string, options: ParserOptions = {}): string | RenderFactory {
    options = assign({}, DEFAULT_OPTIONS, options);

    const factory = new Factory(options);
    const p = new Parser({
        onopentag(name, attrs) {
            if (options.tags[name]) {
                options.tags[name].startTag(factory, name, attrs);
            } else {
                const fcAttrs = Statements.get(options);
                const fcProps = Statements.get(options);
                const fcOpts = Statements.get(options);
                Object.keys(attrs).forEach((attName) => {
                    if (attName === 'fc-key') {
                        fcOpts.append(`'key', ${interpolate(attrs[attName], options)}`);
                    } else if (attName === 'fc-content') {
                        fcOpts.append(`'content', true`);
                    } else {
                        let targetName = attName;
                        let destination = fcAttrs;

                        const index = attName.indexOf(options.propNamePrefix);
                        if (index > -1) {
                            targetName = toCamelCase(attName.substring(index + 1));
                            destination = fcProps;
                        }

                        destination.append(`'${targetName}', ${interpolate(attrs[attName], options)}`);
                    }
                });
                if (options.selfClosingElements.indexOf(name) > -1) {
                    factory.appendVoidElement(
                        name,
                        `[${fcAttrs.join(',')}]`,
                        `[${fcProps.join(',')}]`,
                        `[${fcOpts.join(',')}]`
                    );
                } else {
                    factory.appendOpenElement(
                        name,
                        `[${fcAttrs.join(',')}]`,
                        `[${fcProps.join(',')}]`,
                        `[${fcOpts.join(',')}]`
                    );
                }
            }
        },

        onclosetag(name) {
            if (options.tags[name]) {
                options.tags[name].endTag(factory, name);
            } else if (options.selfClosingElements.indexOf(name) < 0) {
                factory.appendCloseElement();
            }
        },

        ontext(text) {
            factory.appendText(interpolate(text, options));
        },

        oncomment(text) {
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
