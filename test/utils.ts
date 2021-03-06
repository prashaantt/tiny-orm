import { expect as assert } from 'code';
import * as Joi from 'joi';
import { script } from 'lab';
import { camelCase, snakeCase } from 'change-case';

import { prop } from '../src';
import { validate, getObject, changeCaseDeep } from '../src/utils';

const lab = exports.lab = script();
const { suite, test } = lab;

suite('The validate function', () => {
    test('validates correctly', (done) => {
        assert(() => validate(5, Joi.number().min(1).max(5), 'MyClass.someProp')).not.throws();

        done();
    });

    test('reports correct message on error', (done) => {
        assert(() => validate(6, Joi.number().min(1).max(5), 'MyClass.someProp')).throws(Error);

        done();
    });
});

suite('The changeCaseDeep function', () => {
    test('immutably performs deep object transformations', (done) => {
        const camelCasedObj = {
            primitiveProp: 1,
            objectProp: {
                innerProp: 2,
                innerArrayProp: [
                    {
                        deepProp: 3,
                        deeperProp: {
                            deepestProp: 5
                        }
                    },
                    4
                ]
            }
        };

        const snakeCased = {
            primitive_prop: 1,
            object_prop: {
                inner_prop: 2,
                inner_array_prop: [
                    {
                        deep_prop: 3,
                        deeper_prop: {
                            deepest_prop: 5
                        }
                    },
                    4
                ]
            }
        };

        let transformedObj = changeCaseDeep(camelCasedObj, snakeCase);
        assert(transformedObj).equals(snakeCased);

        transformedObj = changeCaseDeep(transformedObj, camelCase);
        assert(transformedObj).equals(camelCasedObj);

        done();
    });
});

suite('The getObject function', () => {
    test('returns expected props from the original object', (done) => {
        class MyClass {
            someProp: string;
            anotherProp: number;

            constructor() {
                this.someProp = 'value';
                this.anotherProp = 1;
            }
        }

        const original = new MyClass();
        const duplicate = new MyClass();

        prop(Joi.any())(duplicate, 'someProp');
        duplicate.someProp = 'value';
        duplicate.anotherProp = 1;

        const obj = getObject((<any>duplicate)._props) as MyClass;
        assert(obj.someProp).equals(original.someProp);
        assert(obj.anotherProp).undefined();

        done();
    });
});
