import * as Joi from 'joi';
import { snakeCase } from 'change-case';

export type SchemaType = Joi.AnySchema<Joi.Schema> | Joi.SchemaMap;

export function joiValidate(value: any, schema: SchemaType) {
    Joi.validate(value, schema, (err) => {
        if (err) {
            throw err;
        }
    });
}

export function getObject(rootObject: any, snakeCased = false) {
    const obj = {};

    for (let key in rootObject) {
        const column = rootObject[key];
        key = snakeCased ? snakeCase(key) : key;

        if (Array.isArray(column.value)) {
            Object.assign(obj, { [key]: column.value.map((i: any) => i.getObject(snakeCased)) });
        }
        else if (typeof column.value === 'object') {
            Object.assign(obj, { [key]: column.value.getObject(snakeCased) });
        }
        else {
            Object.assign(obj, { [key]: column.value });
        }
    }

    return obj;
}
