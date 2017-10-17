import {Factory} from './Factory';
import {FcTag} from './FcTag';
import {Map} from './model';

/**
 * A funclate's tag implementing a else clause.
 * @example
 * <fc-if condition="el.foo === 'bar'">
 *     <span>foo is bar</span>
 * <fc-else/>
 *     <span>foo is not bar</span>
 * </fc-if>
 */
export class FcElseTag extends FcTag {

    public startTag(factory: Factory, name: string, attributes: Map<string>) {
        factory.append(`} else {`);
    }

}
