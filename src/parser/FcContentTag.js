import {FcTag} from './FcTag';

/**
 * A funclate's tag to specify a content node.
 * @example
 * <fc-content></fc-each>
 */
export class FcContentTag extends FcTag {
    /**
     * @override FcTag#startTag
     */
    startTag(factory, name, attributes, selfClosing) {
        factory.appendContent();
    }
}
