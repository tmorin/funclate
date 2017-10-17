import {Factory} from './Factory';
import {FcTag} from './FcTag';
import {Map} from './model';

/**
 * A funclate's tag implementing a if clause.
 * @example
 * <fc-if condition="el.foo === 'bar'">
 *     <span>foo is bar</span>
 * </fc-if>
 */
export class FcIfTag extends FcTag {

    public startTag(factory: Factory, name: string, attributes: Map<string>) {
        const condition = attributes['fc-condition'] ? attributes['fc-condition'] : 'false';
        factory.append(`if (${condition}) {`);
    }

    public endTag(factory: Factory, name: string) {
        factory.append('}');
    }

}
