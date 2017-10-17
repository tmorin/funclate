import {FcAttHandler} from './FcAttributeHandler';
import {ParserOptions} from './ParserOptions';
import {Statements} from './Statements';

export class FcContentAttHandler extends FcAttHandler {

    public handle(name: string,
                  value: string,
                  fcAttrs: Statements,
                  fcProps: Statements,
                  fcOpts: Statements,
                  options: ParserOptions): void {
        fcOpts.append(`'content', true`);
    }

}
