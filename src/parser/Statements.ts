import {ParserOptions} from './ParserOptions';

export class Statements {

    public static get(options) {
        return new Statements(options);
    }

    private options: ParserOptions;
    private statements: string[];

    constructor(options: ParserOptions) {
        this.options = options;
        this.statements = [];
    }

    public append(statement: string) {
        this.statements.push(statement);
        return this;
    }

    public join(separator?: string) {
        if (separator) {
            return this.statements.join(separator);
        }
        return this.statements.join(this.options.pretty ? '\n' : '');
    }

}
