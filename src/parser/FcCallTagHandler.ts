import {Map} from '../model';
import {Factory} from './Factory';
import {FcTagHandler} from './FcTagHandler';
import {ParserOptions} from './ParserOptions';

/**
 * A funclate's tag to call another funclate's render function.
 * @example
 * <fc-call fc-name="ctx.anotherRenderFunction"></fc-call>
 */
export class FcCallTagHandler extends FcTagHandler {

    public startTag(factory: Factory,
                    name: string,
                    attributes: Map<string>,
                    options: ParserOptions): void {

        const fnName = attributes['fc-name'];

        if (fnName) {
            factory.append(`${fnName}(__el__, __ctx__);`);
        }

    }

    public endTag(factory: Factory,
                  name: string,
                  options: ParserOptions): void {
    }
}
