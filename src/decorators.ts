import { SchemaType, validate } from './utils';

export function field(schema?: SchemaType) {
    return function (target: any, key: string) {
        Object.defineProperty(target, key, {
            get: function () {
                return this._columns[key].value;
            },
            set: function (value: any) {
                this._columns = this._columns || {};
                this._columns[key] = this._columns[key] || {};
                this._columns[key].value = value;

                if (schema) {
                    this._columns[key].schema = schema;

                    if (this.strictValidation) {
                        const propertyName = this.constructor.name + '.' + key;

                        validate(value, schema, propertyName);
                    }
                }
            },
            enumerable: true
        });
    };
}

export function strict(ctr: Function) {
    ctr.prototype.strictValidation = true;
}
