import { getObject, joiValidate, SchemaType } from './utils';
import { camelCase } from 'change-case';

export abstract class BaseModel<T> {
    protected _columns: { [key: string]: { schema: SchemaType, value: any } };
    constructor(model?: T) {
        if (model) {
            for (let key in model) {
                (<any>this)[key] = model[key];
            }
        }
    }

    validate() {
        for (let key in this._columns) {
            if (this._columns[key]) {
                joiValidate(this._columns[key].value, this._columns[key].schema);
            }
        }
    }

    toString() {
        return JSON.stringify(this.getObject());
    }

    getObject() {
        return getObject(this._columns) as T;
    }
}

export abstract class DatabaseModel<T> extends BaseModel<T> {
    initFromDb(dbModel: any, override = false) {
        if (this._columns && !override) {
            throw new Error('Model was already initialised in the constructor.');
        }

        for (let key in dbModel) {
            (<any>this)[camelCase(key)] = dbModel[key];
        }
    }

    getObject(snakeCased = false) {
        if (!snakeCased) {
            return super.getObject();
        }

        return getObject(this._columns, snakeCased) as T;
    }

    toString(snakeCased = false) {
        if (!snakeCased) {
            return super.toString();
        }

        const obj = this.getObject(snakeCased);

        return JSON.stringify(obj);
    }
}

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
                        joiValidate(value, schema);
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
