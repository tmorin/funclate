import {Map} from '../model';
import {Factory} from './Factory';
import {FcTagHandler} from './FcTagHandler';
import {ParserOptions} from './ParserOptions';

/**
 * A funclate's tag implementing a else clause.
 * @example
 * <fc-if condition="el.foo === 'bar'">
 *     <span>foo is bar</span>
 * <fc-else/>
 *     <span>foo is not bar</span>
 * </fc-if>
 */
export class FcElseTagHandler extends FcTagHandler {

    public startTag(factory: Factory, name: string, attributes: Map<string>, options: ParserOptions): void {
        factory.append(`} else {`);
    }

    public endTag(factory: Factory, name: string, options: ParserOptions): void {
    }
}
