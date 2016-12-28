import * as Joi from 'joi';

export type SchemaType = Joi.AnySchema<Joi.Schema> | Joi.SchemaMap;

export function validate(value: any, schema: SchemaType, propertyName: string) {
    Joi.validate(value, schema, (err) => {
        if (err) {
            err.message = err.message.replace('"value"', `: ${propertyName}`);
            throw err;
        }
    });

    return true;
}

export function getObject(model: any) {
    const obj = {};

    for (let key in model) {
        const column = model[key];

        if (Array.isArray(column.value)) {
            Object.assign(obj, {
                [key]: column.value.map((item: any) => {

                    if (typeof item !== 'object') {
                        return item;
                    }

                    return getObject(item);
                })
            });
        }
        else if (typeof column.value === 'object') {
            Object.assign(obj, {
                [key]: new this(getObject(column.value))
            });
        }
        else {
            Object.assign(obj, {
                [key]: column.value || column
            });
        }
    }

    return obj;
}

export function changeCaseDeep(obj: any, fn: Function) {
    const o = {} as any;

    for (let key in obj) {
        const changedKeyCase = fn(key);

        if (Array.isArray(obj[key])) {
            Object.assign(o, {
                [changedKeyCase]: obj[key].map((item: any) => {

                    if (typeof item !== 'object') {
                        return item;
                    }

                    return changeCaseDeep(item, fn);
                })
            });
        }
        else if (typeof obj[key] === 'object') {
            changeCaseDeep(obj[key], fn);
        }
        else {
            o[changedKeyCase] = obj[key];
        }
    }

    return o;
}
