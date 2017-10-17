import {Factory} from './Factory';
import {FcTag} from './FcTag';
import {Map} from './model';

/**
 * A funclate's tag implementing a else clause.
 * @example
 * <fc-if condition="el.foo === 'bar'">
 *     <span>foo is bar</span>
 * <fc-else if condition="el.foo === 'bar²'"/>
 *     <span>foo is bar²</span>
 * </fc-if>
 */
export class FcElseIfTag extends FcTag {

    public startTag(factory: Factory, name: string, attributes: Map<string>) {
        const condition = attributes['fc-condition'] ? attributes['fc-condition'] : 'false';
        factory.append(`} else if (${condition}) {`);
    }

}
