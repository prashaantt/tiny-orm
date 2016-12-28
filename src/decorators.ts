import { SchemaType, validate } from './utils';

export function prop(schema?: SchemaType) {
    return function (target: any, key: string) {
        Object.defineProperty(target, key, {
            get: function () {
                return this._props[key].value;
            },
            set: function (value: any) {
                this._props = this._props || {};
                this._props[key] = this._props[key] || {};
                if (schema) {
                    if (!this._props[key].schema) {
                        this._props[key].schema = schema;
                    }

                    if (this.strictMode) {
                        const propName = this.constructor.name + '.' + key;

                        validate(value, schema, propName);
                    }
                }

                this._props[key].value = value;
            },
            enumerable: true
        });
    };
}

export function strict(constructor: Function) {
    constructor.prototype.strictMode = true;
}
