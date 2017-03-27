import {FcTag} from './FcTag';

/**
 * A funclate's tag implementing a if clause.
 * @example
 * <fc-if condition="el.foo === 'bar'">
 *     <span>foo is bar</span>
 * </fc-if>
 */
export class FcIfTag extends FcTag {
    /**
     * @override FcTag#startTag
     */
    startTag(factory, name, attributes, selfClosing) {
        const condition = attributes['fc-condition'] ? attributes['fc-condition'] : 'false';
        factory.append(`if (${condition}) {`);
    }

    /**
     * @override FcTag#endTag
     */
    endTag(factory, name) {
        factory.append('}');
    }
}
