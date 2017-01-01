import { expect as assert } from 'code';
import * as Joi from 'joi';
import { script } from 'lab';
import { camelCase, snakeCase } from 'change-case';

import { TinyORM, prop, strict } from '../src';

const lab = exports.lab = script();
const { suite, test } = lab;

suite('The TinyORM base class', () => {
    test('derives a class that can be validated', (done) => {

        class User extends TinyORM<{}> {
            @prop(Joi.number().min(1))
            id: number;

            @prop(Joi.string().email())
            email: string;

            constructor(id: number, name: string) {
                super();

                this.id = id;
                this.email = name;
            }
        }

        const user = new User(0, 'test@example.com');

        assert(() => user.validate())
            .throws(Error, 'User.id must be larger than or equal to 1');

        user.id = 1;

        assert(() => user.validate()).not.throws();

        done();
    });

    test('derives a class that is auto-validated in strict mode', (done) => {

        @strict
        class User extends TinyORM<{}> {
            @prop(Joi.number().min(1))
            id: number;

            @prop(Joi.string().email())
            email: string;

            constructor(id: number, name: string) {
                super();

                this.id = id;
                this.email = name;
            }
        }

        let user;

        assert(() => { user = new User(1, 'test'); })
            .throws(Error, 'User.email must be a valid email');

        assert(user).undefined();

        assert(() => { user = new User(1, 'test@example.com'); }).not.throws();

        assert(user).exists();

        let message;

        try {
            (<any>user).id = 0;
        }
        catch (err) {
            message = err.message;
        }
        finally {
            assert(message).equals('User.id must be larger than or equal to 1');
        }

        assert((<any>user).id).equals(1);

        done();
    });

    test('derives a class with strongly typed constructor arguments from a generic', (done) => {
        interface IUser {
            id: number;
            email: string;
        }

        @strict
        class User extends TinyORM<IUser> implements IUser {
            @prop(Joi.number().min(1))
            id: number;

            @prop(Joi.string().email())
            email: string;
        }

        const user = new User({
            id: 1,
            email: 'test@example.com'
        });

        assert(() => { user.id = 0; })
            .throw(Error, 'User.id must be larger than or equal to 1');

        assert(user.id).equals(1);

        done();
    });

    test('validates a multi-type property with complex schema', (done) => {
        interface IUser {
            id: number | string;
        }

        const complexSchema = [
            Joi.number().min(1).max(3),
            Joi.string().valid('one', 'two', 'three')
        ];

        @strict
        class User extends TinyORM<IUser> implements IUser {
            @prop(complexSchema)
            id: number | string;
        }

        let error;

        try {
            const user = new User({ id: 'two' });
            user.id = 2;
        }
        catch (err) {
            error = err;
        }
        finally {
            assert(error).undefined();
        }

        done();
    });

    test('initialises from a random source and normalises props to camelCase', (done) => {
        interface IUser {
            userGuid: string;
            userEmail: string;
        }

        @strict
        class User extends TinyORM<IUser> implements IUser {
            @prop(Joi.string().email())
            userEmail: string;

            @prop(Joi.string().guid())
            userGuid: string;
        }

        const user_guid = '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f';
        const user_email = 'test@example.com';

        const test = User.getInstance({
            user_email,
            user_guid
        }) as User;

        assert(test.userGuid).equals(user_guid);
        assert(test.userEmail).equals(user_email);

        done();
    });

    test('returns valid decorated props through toObject', (done) => {
        interface IUser {
            id: number;
        }

        @strict
        class User extends TinyORM<IUser> implements IUser {
            @prop(Joi.number().min(1).max(5))
            id: number;

            someMethod() {
                return this.id * 2;
            }
        }

        const user = new User({ id: 1 });
        const obj = user.toObject();

        assert(obj.id).equals(user.id);
        assert((<User>obj).someMethod).undefined();

        done();
    });

    test('returns a valid object with snake_cased props', (done) => {
        interface IUser {
            userGuid: string;
            userEmail: string;
        }

        @strict
        class User extends TinyORM<IUser> implements IUser {
            @prop(Joi.string().email())
            userEmail: string;

            @prop(Joi.string().guid())
            userGuid: string;
        }

        const user = new User({
            userGuid: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f',
            userEmail: 'test@example.com'
        });

        const camelCasedTest = user.toDbObject() as User;
        assert((<any>camelCasedTest).user_guid).equals(user.userGuid);
        assert(camelCasedTest.userGuid).undefined();
        assert((<any>camelCasedTest).user_email).equals(user.userEmail);
        assert(camelCasedTest.userEmail).undefined();

        done();
    });

    test('returns the stringified object', (done) => {
        interface IUser {
            id: number;
            email: string;
        }

        @strict
        class User extends TinyORM<IUser> implements IUser {
            @prop(Joi.number().min(1))
            id: number;

            @prop(Joi.string().email())
            email: string;
        }

        const test = new User({
            id: 1,
            email: 'test@example.com'
        });

        const testStr = '{"id":1,"email":"test@example.com"}';

        assert(test.toString()).equals(testStr);

        done();
    });
});
