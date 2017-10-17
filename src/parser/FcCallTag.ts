import {Factory} from './Factory';
import {FcTag} from './FcTag';
import {Map} from './model';

/**
 * A funclate's tag to call another funclate's render function.
 * @example
 * <fc-call fc-name="ctx.anotherRenderFunction"></fc-call>
 */
export class FcCallTag extends FcTag {

    public startTag(factory: Factory, name: string, attributes: Map<string>) {
        const fnName = attributes['fc-name'];
        if (fnName) {
            factory.append(`${fnName}(__el__, __ctx__);`);
        }
    }

}
