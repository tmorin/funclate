import {Map} from '../model';
import {Factory} from './Factory';
import {FcTagHandler} from './FcTagHandler';
import {ParserOptions} from './ParserOptions';

/**
 * A funclate's tag implementing a else clause.
 * @example
 * <fc-if condition="el.foo === 'bar'">
 *     <span>foo is bar</span>
 * <fc-else if condition="el.foo === 'bar²'"/>
 *     <span>foo is bar²</span>
 * </fc-if>
 */
export class FcElseIfTagHandler extends FcTagHandler {

    public startTag(factory: Factory, name: string, attributes: Map<string>, options: ParserOptions): void {
        const condition = attributes['fc-condition'] ? attributes['fc-condition'] : 'false';
        factory.append(`} else if (${condition}) {`);
    }

    public endTag(factory: Factory, name: string, options: ParserOptions): void {
    }

}
