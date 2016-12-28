import * as Code from 'code';
import * as Joi from 'joi';
import { script } from 'lab';
import { camelCase, snakeCase } from 'change-case';

import { TinyORM, prop, strict } from '../src';

const lab = exports.lab = script();
const assert = Code.expect;
const { suite, test } = lab;

suite('The TinyORM base class', () => {
    test('derives a class that can be validated', (done) => {

        interface ITest {
            id: number;
        }

        class Test extends TinyORM<ITest> implements ITest {
            @prop(Joi.number().equal(1))
            id: number;
        }

        const test = new Test({ id: 1 });

        assert(test.validate()).true();

        done();
    });

    test('derives an auto-validating class in strict mode', (done) => {
        interface ITest {
            id: number;
        }

        @strict
        class Test extends TinyORM<ITest> implements ITest {
            @prop(Joi.number().min(1).max(5))
            id: number;

            someMethod() {
                return this.id * 2;
            }
        }

        const test = new Test({ id: 1 });
        assert(test.someMethod()).equals(2);

        let message;

        try {
            test.id = 6;
        }
        catch (err) {
            message = err.message;
        }
        finally {
            assert(message).exists();
            assert(message).startsWith('Test.id');
        }

        assert(test.id).equals(1);

        done();
    });

    test('initialises from a random source and normalises props to camelCase', (done) => {
        interface ITest {
            id: number;
            authorId: string;
        }

        @strict
        class Test extends TinyORM<ITest> implements ITest {
            @prop(Joi.number().min(1))
            id: number;

            @prop(Joi.string().guid())
            authorId: string;
        }

        const author_id = '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f';

        const test = Test.getInstance({
            id: 1,
            author_id
        }) as Test;

        assert(test.authorId).equal(author_id);

        done();
    });

    test('returns the valid decorated object', (done) => {
        interface ITest {
            id: number;
        }

        @strict
        class Test extends TinyORM<ITest> implements ITest {
            @prop(Joi.number().min(1).max(5))
            id: number;

            someMethod() {
                return this.id * 2;
            }
        }

        const test = new Test({ id: 1 });
        const obj = test.toObject();

        assert(obj.id).equals(test.id);
        assert((<Test>obj).someMethod).undefined();

        done();
    });

    test('returns a valid object with snake_cased props', (done) => {
        interface ITest {
            id: number;
            authorId: string;
        }

        @strict
        class Test extends TinyORM<ITest> implements ITest {
            @prop(Joi.number().min(1))
            id: number;

            @prop(Joi.string().guid())
            authorId: string;
        }

        const author_id = '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f';

        const test = new Test({
            id: 1,
            authorId: author_id
        });

        const camelCasedTest = test.toDBObject();
        assert(camelCasedTest.author_id).equals(author_id);
        assert(camelCasedTest.authorId).undefined();

        done();
    });

    test('returns the stringified object', (done) => {
        interface ITest {
            id: number;
            authorId: string;
        }

        @strict
        class Test extends TinyORM<ITest> implements ITest {
            @prop(Joi.number().min(1))
            id: number;

            @prop(Joi.string().guid())
            authorId: string;
        }

        const author_id = '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f';

        const test = new Test({
            id: 1,
            authorId: author_id
        });

        const testStr = '{"id":1,"authorId":"3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f"}';
        const testStrSnake = '{"id":1,"author_id":"3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f"}';

        assert(test.toString()).equals(testStr);
        assert(JSON.stringify(test.toDBObject())).equals(testStrSnake);
        done();
    });
});