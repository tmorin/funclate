import {ParserOptions} from './ParserOptions';
import {Statements} from './Statements';
import {interpolate, toCamelCase} from './utils';

export class FcSkipChildrenHandler {

    public handle(name: string,
                  value: string,
                  fcAttrs: Statements,
                  fcProps: Statements,
                  fcOpts: Statements,
                  options: ParserOptions): void {
        fcOpts.append(`'skip-children', true`);
    }

}
