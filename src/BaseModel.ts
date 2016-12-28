import { camelCase, snakeCase } from 'change-case';

import { changeCaseDeep, getObject, validate, SchemaType } from './utils';

interface Columns {
    [key: string]: { schema: SchemaType, value: any };
}

export class BaseModel<T> {
    private _columns: Columns;

    constructor(model: T) {
        for (let key in model) {
            (<any>this)[key] = model[key];
        }
    }

    static getInstance(model: any) {
        model = changeCaseDeep(model, camelCase);

        return new this(model);
    }

    validate() {
        for (let key in this._columns) {
            if (this._columns[key].schema) {
                const propertyName = this.constructor.name + '.' + key;

                return validate(this._columns[key].value, this._columns[key].schema, propertyName);
            }
        }

        return true;
    }

    toObject(snakeCased = false) {
        const obj = getObject(this._columns);

        if (snakeCased) {
            return changeCaseDeep(obj, snakeCase) as T;
        }

        return obj as T;
    }

    toString(snakeCased = false) {
        return JSON.stringify(this.toObject(snakeCased));
    }
}
