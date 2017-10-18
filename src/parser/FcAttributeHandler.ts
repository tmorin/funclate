import {ParserOptions} from './ParserOptions';
import {Statements} from './Statements';
import {interpolate, toCamelCase} from './utils';

export class FcAttHandler {

    public handle(name: string,
                  value: string,
                  fcAttrs: Statements,
                  fcProps: Statements,
                  fcOpts: Statements,
                  options: ParserOptions): void {

        let targetName = name;
        let destination = fcAttrs;
        let interpolatedValue = interpolate(value, options);

        const index = name.indexOf(options.propNamePrefix);
        if (index > -1) {
            targetName = toCamelCase(name.substring(index + 1));
            destination = fcProps;
            destination.append(`'${targetName}', ${interpolatedValue || 'undefined'}`);
        } else {
            destination.append(`'${targetName}', ${interpolatedValue || '\'\''}`);
        }
    }

}
