import {Map} from '../model';
import {Factory} from './Factory';
import {FcTagHandler} from './FcTagHandler';
import {ParserOptions} from './ParserOptions';

/**
 * A funclate's tag implementing a if clause.
 * @example
 * <fc-if condition="el.foo === 'bar'">
 *     <span>foo is bar</span>
 * </fc-if>
 */
export class FcIfTagHandler extends FcTagHandler {

    public startTag(factory: Factory, name: string, attributes: Map<string>, options: ParserOptions): void {
        const condition = attributes['fc-condition'] ? attributes['fc-condition'] : 'false';
        factory.append(`if (${condition}) {`);
    }

    public endTag(factory: Factory, name: string, options: ParserOptions): void {
        factory.append('}');
    }

}
