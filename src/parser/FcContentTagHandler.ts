import {Map} from '../model';
import {Factory} from './Factory';
import {FcTagHandler} from './FcTagHandler';
import {ParserOptions} from './ParserOptions';

/**
 * A funclate's tag to specify a content node.
 * @example
 * <fc-content></fc-content>
 */
export class FcContentTagHandler extends FcTagHandler {

    public startTag(factory: Factory, name: string, attributes: Map<string>, options: ParserOptions): void {
        factory.appendContent();
    }

    public endTag(factory: Factory, name: string, options: ParserOptions): void {
    }
}
