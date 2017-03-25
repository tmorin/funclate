import {FcTag} from './FcTag';

/**
 * A funclate's tag implementing a if clause.
 * @example
 * <fc-if condition="el.foo === 'bar'">
 *     <span>foo is bar</span>
 * </fc-if>
 */
export class FcIfTag extends FcTag {
    startTag(factory, name, attributes, selfClosing) {
        const condition = attributes['fc-condition'] ? attributes['fc-condition'].value : 'false';
        factory.append(`if (${condition}) {`);
    }

    endTag(factory, name) {
        factory.append('}');
    }
}
