import {FcTag} from './FcTag';

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
    startTag(factory, name, attributes, selfClosing) {
        const condition = attributes['fc-condition'] ? attributes['fc-condition'].value : 'false';
        factory.append(`} else if (${condition}) {`);
    }

    endTag(factory, name) {
    }
}
