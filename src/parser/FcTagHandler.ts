import {Map} from '../model';
import {Factory} from './Factory';
import {ParserOptions} from './ParserOptions';
import {Statements} from './Statements';

export class FcTagHandler {

    /**
     * Invoked when starting tag of the element is found.
     * @param {Factory} factory
     * @param {string} name
     * @param {Map<string>} attributes
     * @param {ParserOptions} options
     */
    public startTag(factory: Factory, name: string, attributes: Map<string>, options: ParserOptions): void {
        const fcAttrs = Statements.get(options);
        const fcProps = Statements.get(options);
        const fcOpts = Statements.get(options);

        Object.keys(attributes).forEach((attName) => {
            const handler = options.attHandlers[attName] ? options.attHandlers[attName] : options.attHandlers['*'];
            if (handler) {
                handler.handle(
                    attName,
                    attributes[attName],
                    fcAttrs,
                    fcProps,
                    fcOpts,
                    options
                );
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

    /**
     * Invoked when ending tag of the element is found.
     * @param {Factory} factory
     * @param {string} name
     * @param {ParserOptions} options
     */
    public endTag(factory: Factory, name: string, options: ParserOptions): void {
        if (options.selfClosingElements.indexOf(name) < 0) {
            factory.appendCloseElement();
        }
    }

}
