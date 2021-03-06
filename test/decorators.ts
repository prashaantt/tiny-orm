import { expect as assert } from 'code';
import * as Joi from 'joi';
import { script } from 'lab';

import { prop, strict } from '../src';

const lab = exports.lab = script();
const { suite, test } = lab;

suite('The strict decorator', () => {
    test('adds strictMode to a class constructor', (done) => {

        class MyClass { }

        assert((<any>new MyClass()).strictMode).undefined();

        strict(MyClass);

        assert((<any>new MyClass()).strictMode).equals(true);

        done();
    });
});

suite('The prop decorator', () => {
    test('sets correct internal props', (done) => {

        class MyClass {
            someProp: string;
        }

        const instance = new MyClass();

        prop(Joi.any())(instance, 'someProp');

        instance.someProp = 'value';

        const props = (<any>instance)._props;

        assert(props).exists();
        assert(props.someProp).exists();
        assert(props.someProp.value).equals(instance.someProp);
        assert(props.someProp.schema).equals(Joi.any());

        done();
    });

    test('does nothing if strict validation is disabled', (done) => {

        class MyClass {
            numberPretendingToBeString: string;
        };

        const instance = new MyClass();

        prop(Joi.number())(instance, 'numberPretendingToBeString');

        let error = false;

        assert(() => { instance.numberPretendingToBeString = 'abc'; })
            .not.throws();

        done();
    });

    test('validates correctly if strict is enabled', (done) => {

        class MyClass {
            numberPretendingToBeString: string;
            numberBetweenOneAndTen: number;
        };

        strict(MyClass);

        const instance = new MyClass();

        prop(Joi.number())(instance, 'numberPretendingToBeString');
        prop(Joi.number().min(1).max(10))(instance, 'numberBetweenOneAndTen');

        assert(() => { instance.numberPretendingToBeString = 'abc'; }).throws();

        assert(() => { instance.numberBetweenOneAndTen = 10; }).not.throws();

        done();
    });
});
