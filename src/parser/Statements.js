/**
 * @private
 */
export class Statements {
    constructor(options) {
        this.options = options;
        this.statements = [];
    }

    append(statement) {
        this.statements.push(statement);
        return this;
    }

    join(separator) {
        if (separator) {
            return this.statements.join(separator);
        }
        return this.statements.join(this.options.pretty ? '\n' : '');
    }

    static get(options) {
        return new Statements(options);
    }
}
