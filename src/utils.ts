import * as Joi from 'joi';

export type SchemaType = Joi.AnySchema<Joi.Schema> | Joi.SchemaMap | Joi.AnySchema<Joi.Schema>[];

export function validate(value: any, schema: SchemaType, propName?: string) {
    Joi.validate(value, schema, (err) => {
        if (err) {
            err.message = propName ? err.message.replace(/"value"/g, propName) : err.message;
            throw err;
        }
    });
}

export function getObject(model: any) {
    let obj = {};

    for (let key in model) {
        const _prop = model[key];

        if (Array.isArray(_prop.value)) {
            obj = {
                ...obj, [key]: _prop.value.map((item: any) => {

                    if (typeof item !== 'object') {
                        return item;
                    }

                    return getObject(item);
                })
            };
        }
        else if (typeof _prop.value === 'object') {
            obj = {
                ...obj, [key]: getObject(_prop.value)
            };
        }
        else {
            obj = {
                ...obj, [key]: _prop.value || _prop
            };
        }
    }

    return obj;
}

export function changeCaseDeep(obj: any, fn: Function) {
    let changedObj = {};

    for (let key in obj) {
        const changedKeyCase = fn(key);

        if (Array.isArray(obj[key])) {
            changedObj = {
                ...changedObj, [changedKeyCase]: obj[key].map((item: any) => {

                    if (typeof item !== 'object') {
                        return item;
                    }

                    return changeCaseDeep(item, fn);
                })
            };
        }
        else if (typeof obj[key] === 'object') {
            changedObj = {
                ...changedObj, [changedKeyCase]: changeCaseDeep(obj[key], fn)
            };
        }
        else {
            changedObj = {
                ...changedObj, [changedKeyCase]: obj[key]
            };
        }
    }

    return changedObj;
}
