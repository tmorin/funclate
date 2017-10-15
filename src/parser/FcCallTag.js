import {FcTag} from './FcTag';

/**
 * A funclate's tag to call another funclate's render function.
 * @example
 * <fc-call></fc-call>
 */
export class FcCallTag extends FcTag {
    /**
     * @override FcTag#startTag
     */
    startTag(factory, name, attributes, selfClosing) {
        let fnName = attributes.name;
        factory.append(`${fnName}(__el__, __ctx__);`);
    }
}
