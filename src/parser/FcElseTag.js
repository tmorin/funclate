import {FcTag} from './FcTag';

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
    startTag(factory, name, attributes, selfClosing) {
        factory.append(`} else {`);
    }

}

