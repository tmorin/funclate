import {Factory} from './Factory';
import {FcTag} from './FcTag';
import {Map} from './model';

/**
 * A funclate's tag to specify a content node.
 * @example
 * <fc-content></fc-content>
 */
export class FcContentTag extends FcTag {

    public startTag(factory: Factory, name: string, attributes: Map<string>) {
        factory.appendContent();
    }

}
