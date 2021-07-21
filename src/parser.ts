import {Parser} from 'htmlparser2';
import {RenderFactory} from './model';
import {Factory} from './parser/Factory';
import {FcAttHandler} from './parser/FcAttributeHandler';
import {FcCallTagHandler} from './parser/FcCallTagHandler';
import {FcContentAttHandler} from './parser/FcContentAttributeHandler';
import {FcContentTagHandler} from './parser/FcContentTagHandler';
import {FcEachTagHandler} from './parser/FcEachTagHandler';
import {FcElseIfTagHandler} from './parser/FcElseIfTagHandler';
import {FcElseTagHandler} from './parser/FcElseTagHandler';
import {FcIfTagHandler} from './parser/FcIfTagHandler';
import {FcKeyAttHandler} from './parser/FcKeyAttributeHandler';
import {FcSkipChildrenHandler} from "./parser/FcSkipChildrenHandler";
import {FcTagHandler} from './parser/FcTagHandler';
import {AttHandlers, ParserOptions, TagHandlers} from './parser/ParserOptions';
import {assign, interpolate} from './parser/utils';

const DEFAULT_TAG_HANDLERS: TagHandlers = {
    '*': new FcTagHandler(),
    'fc-each': new FcEachTagHandler(),
    'fc-if': new FcIfTagHandler(),
    'fc-else': new FcElseTagHandler(),
    'fc-else-if': new FcElseIfTagHandler(),
    'fc-content': new FcContentTagHandler(),
    'fc-call': new FcCallTagHandler()
};

const DEFAULT_ATT_HANDLERS: AttHandlers = {
    '*': new FcAttHandler(),
    'fc-key': new FcKeyAttHandler(),
    'fc-content': new FcContentAttHandler(),
    'fc-skip': new FcSkipChildrenHandler(),
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
    tagHandlers: DEFAULT_TAG_HANDLERS,
    attHandlers: DEFAULT_ATT_HANDLERS
};

/**
 * Parse an HTML template and return the factory of the underlying render function.
 * @param {string} html the HTML content to parse
 * @param {ParserOptions} options the options
 * @return {string | RenderFactory} the factory function as Function or string.
 */
export function parse(html: string, options: ParserOptions = {}): string | RenderFactory {
    options = assign({}, DEFAULT_OPTIONS, options);
    options.tagHandlers = assign({}, DEFAULT_TAG_HANDLERS, options.tagHandlers) as TagHandlers;
    options.attHandlers = assign({}, DEFAULT_ATT_HANDLERS, options.attHandlers) as AttHandlers;

    const factory = new Factory(options);
    const p = new Parser({
        onopentag(name, attrs) {
            const tagHandler = options.tagHandlers[name] ? options.tagHandlers[name] : options.tagHandlers['*'];
            if (tagHandler) {
                tagHandler.startTag(factory, name, attrs, options);
            }
        },

        onclosetag(name) {
            const tagHandler = options.tagHandlers[name] ? options.tagHandlers[name] : options.tagHandlers['*'];
            if (tagHandler) {
                tagHandler.endTag(factory, name, options);
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
