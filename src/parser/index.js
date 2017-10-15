import htmlparser2 from 'htmlparser2';
import {FcCallTag} from './FcCallTag';
import {FcContentTag} from './FcContentTag';
import {FcEachTag} from './FcEachTag';
import {FcIfTag} from './FcIfTag';
import {FcElseTag} from './FcElseTag';
import {FcElseIfTag} from './FcElseIfTag';
import {Statements} from './Statements';
import {Factory} from './Factory';
import {assign, interpolate, toCamelCase} from './utils';

/**
 * @typedef {object} BUILT_IN_TAGS
 * @desc The built in tags provided by funclate.
 * @property {FcEachTag} fc-each a forEach loop implementation
 * @property {FcIfTag} fc-if a if clause implementation
 * @property {FcElseTag} fc-else a else clause implementation
 * @property {FcElseIfTag} fc-if-else a if-else clause implementation
 * @property {FcElseIfTag} fc-content A funclate's tag to specify a content node.
 */

const tags = {
    'fc-each': new FcEachTag(),
    'fc-if': new FcIfTag(),
    'fc-else': new FcElseTag(),
    'fc-else-if': new FcElseIfTag(),
    'fc-content': new FcContentTag(),
    'fc-call': new FcCallTag()
};

/**
 * @typedef {object} ParserOptions
 * @desc The override-able options of funclate.
 * @property {string} output the output format <code>HTML</code> or <code>function</code>
 * @property {boolean} pretty to add <code>\n</code> after between Javascript statements
 * @property {RegExp} interpolation RegExp to inject interpolated values.
 * @property {string} propNamePrefix the prefix value of attribute name to identified properties
 * @property {string} elVarName the variable name for the element
 * @property {string} ctxVarName the variable name for the context
 * @property {Array<string>} selfClosingElements The list of self closing elements. (http://www.w3.org/TR/html5/syntax.html#void-elements)
 * @property {BUILT_IN_TAGS} tags The built in and custom tags.
 */

/**
 * @type ParserOptions
 */
const DEFAULT_OPTIONS = {
    output: 'function',
    pretty: false,
    interpolation: /\{\{([\s\S]+?)}}/gm,
    propNamePrefix: '#',
    elVarName: 'el',
    ctxVarName: 'ctx',
    selfClosingElements: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
    tags: tags
};

/**
 * Parse an HTML template and return the factory of the underlying render function.
 * @param {!string} html the HTML content to parse
 * @param {ParserOptions} [options] the options
 * @return {function|string} the factory function as Function or string.
 */
export function parse(html, options) {
    options = assign({}, DEFAULT_OPTIONS, options);

    const factory = new Factory(options);
    const p = new htmlparser2.Parser({
        onopentag(name, attrs, selfClosing) {
            if (options.tags[name]) {
                options.tags[name].startTag(factory, name, attrs, selfClosing);
            } else {
                const fcAttrs = Statements.get(options);
                const fcProps = Statements.get(options);
                const fcOpts = Statements.get(options);
                Object.keys(attrs).forEach(attName => {
                    if (attName === 'fc-content') {
                        fcOpts.append(`'content', true`);
                    }
                    const index = attName.indexOf(options.propNamePrefix);
                    let name = attName;
                    let destination = fcAttrs;
                    if (index > -1) {
                        name = toCamelCase(attName.substring(index + 1));
                        destination = fcProps;
                    }
                    destination.append(`'${name}', ${interpolate(attrs[attName], options)}`);
                });
                if (options.selfClosingElements.indexOf(name) > -1) {
                    factory.appendVoidElement(name, `[${fcAttrs.join(',')}]`, `[${fcProps.join(',')}]`, `[${fcOpts.join(',')}]`);
                } else {
                    factory.appendOpenElement(name, `[${fcAttrs.join(',')}]`, `[${fcProps.join(',')}]`, `[${fcOpts.join(',')}]`);
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
