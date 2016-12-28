import { camelCase, snakeCase } from 'change-case';

import { changeCaseDeep, getObject, validate, SchemaType } from './utils';

interface TinyProps {
    [key: string]: { schema: SchemaType, value: any };
}

export class TinyORM<T> {
    private _props: TinyProps;

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
        for (let key in this._props) {
            if (this._props[key].schema) {
                const propName = this.constructor.name + '.' + key;

                return validate(this._props[key].value, this._props[key].schema, propName);
            }
        }

        return true;
    }

    toObject() {
        return getObject(this._props) as T;
    }

    toDBObject() {
        const obj = getObject(this._props);

        return changeCaseDeep(obj, snakeCase);
    }

    toString() {
        return JSON.stringify(this.toObject());
    }
}
