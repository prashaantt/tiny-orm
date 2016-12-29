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
    const obj = {};

    for (let key in model) {
        const _prop = model[key];

        if (Array.isArray(_prop.value)) {
            Object.assign(obj, {
                [key]: _prop.value.map((item: any) => {

                    if (typeof item !== 'object') {
                        return item;
                    }

                    return getObject(item);
                })
            });
        }
        else if (typeof _prop.value === 'object') {
            Object.assign(obj, {
                [key]: getObject(_prop.value)
            });
        }
        else {
            Object.assign(obj, {
                [key]: _prop.value || _prop
            });
        }
    }

    return obj;
}

export function changeCaseDeep(obj: any, fn: Function) {
    const changedObj = {} as any;

    for (let key in obj) {
        const changedKeyCase = fn(key);

        if (Array.isArray(obj[key])) {
            Object.assign(changedObj, {
                [changedKeyCase]: obj[key].map((item: any) => {

                    if (typeof item !== 'object') {
                        return item;
                    }

                    return changeCaseDeep(item, fn);
                })
            });
        }
        else if (typeof obj[key] === 'object') {
            Object.assign(changedObj, {
                [changedKeyCase]: changeCaseDeep(obj[key], fn)
            });
        }
        else {
            Object.assign(changedObj, {
                [changedKeyCase]: obj[key]
            });
        }
    }

    return changedObj;
}
