import {FcAttHandler} from './FcAttributeHandler';
import {ParserOptions} from './ParserOptions';
import {Statements} from './Statements';
import {interpolate} from './utils';

export class FcKeyAttHandler extends FcAttHandler {

    public handle(attName: string,
                  attValue: string,
                  fcAttrs: Statements,
                  fcProps: Statements,
                  fcOpts: Statements,
                  options: ParserOptions): void {
        fcOpts.append(`'key', ${interpolate(attValue, options)}`);
    }

}
