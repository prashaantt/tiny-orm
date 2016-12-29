# tiny-orm
> A super tiny ORM for TypeScript.

`tiny-orm` lets you

- auto-validate TypeScript classes using [Joi](https://github.com/hapijs/joi).
- access snake_cased DB objects through camelCased JavaScript objects.
- compose simple classes together to model more complex structures.

# Installation

```bash
$ npm install tiny-orm
```

# Usage

## Basic

At its simplest, any class properties can be decorated with a Joi schema like so:

```ts
class User extends TinyORM<{}> {
    @prop(Joi.number().min(1)) // prop decorator for valid id
    id: number;

    @prop(Joi.string().email()) // prop decorator for valid email
    email: string;

    @prop() // no runtime validation specified, only static string validation will apply
    name: string;

    constructor(id: number, email: string, name: string) {
        super();

        this.id = id;
        this.email = email;
        this.name = name;
    }
}

const user = new User(1, 'test@example.com', 'John Doe');
user.validate(); // ok

user.id = 0;
user.validate(); // throws `User.id must be larger than or equal to 1`
```

The same example can be enhanced to auto-validate upon each mutation:

```ts
@strict // validate() will be automatically called
class User extends TinyORM<{}> {
    @prop(Joi.string().email())
    email: string;

    constructor(email: string) {
        super();
        this.email = email;
    }
}

const user = new User('test@example.com'); // validates without errors

user.email = 'abc' ; // throws `User.email must be a valid email`
```

## Advanced

### Better static typing

Get stronger static typing by supplying an interface:

```ts
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

    // constructor no longer necessary
}

// props to constructor are available through the IUser interface for auto-completion
const user = new User({
    id: 1,
    email: 'test@example.com'
});
```

### `getInstance`

Normalise data from an arbitrary_source (such as a database) to an interface with camelCased properties:

```ts
interface IUser {
    userId: number;
    userEmail: string;
}

@strict
class User extends TinyORM<IUser> implements IUser {
    @prop(Joi.number().min(1))
    userId: number;

    @prop(Joi.string().email())
    userEmail: string;
}

const pgData = {
    user_id: 1,
    user_email: 'test@example.com'
}

const user = User.getInstance(pgData) as User; // init object by calling the static getInstance method

user.userId === pgData.user_id;
user.userEmail === pgData.user_email;
```

### `toObject`, `toDbObject` and `toString`

Get a validated object structure just with all the `@prop`s:

```ts
interface IUser {
    userId: number;
    userEmail: string;
}

@strict
class User extends TinyORM<IUser> implements IUser {
    @prop(Joi.number().min(1))
    userId: number;

    @prop(Joi.string().email())
    userEmail: string;

    someUtilityFunction() {
        return this.userId + ': ' + this.userEmail;
    }
}

const user = new User({
    userId: 1,
    userEmail: 'test@example.com'
});

user.someUtilityFunction(); // 1: test@example.com

user.toObject(); // { userId: 1, userEmail: 'test@example.com' }
user.toDbObject(); // { user_id: 1, user_email: 'test@example.com' }
user.toString(); // overridden method to get JSON representation of .toObject()
```

# Composition

This is left to your imagination. Please note, however, that it's not possible to validate nested objects if they are not directly created using `TinyORM`. This applies especially to nested objects created via the `getInstance` method.

```ts
// Define interfaces

interface IPost {
    id: string;
    title: string;
    createdAt: string;
    comments?: IComment[];
}

interface IComment {
    id: string;
    body: string;
    children?: IComment[];
}

// Declare classes with validation code

@strict
class Post extends TinyORM<IPost> implements IPost {
    @prop(Joi.string().guid())
    id: string;

    @prop()
    title: string;

    @prop(Joi.date().iso())
    createdAt: string;

    @prop(Joi.array())
    comments?: IComment[];
}

@strict
class Comment extends TinyORM<IComment> implements IComment {
    @prop(Joi.string().guid())
    id: string;

    @prop(Joi.string().min(5))
    body: string;

    @prop(Joi.array())
    children?: IComment[];
}

// Create an object using the Post and Comment constructors. These will be fully validated.

let post = new Post({
    id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f',
    title: 'The blog post',
    createdAt: new Date().toISOString(),
    comments: [
        new Comment({
            id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148b',
            body: 'First!',
            children: [
                new Comment({
                    id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148d',
                    body: 'Second!'
                })
            ]
        })
    ]
});

// Or create the object using statically typed object notation.
// Anything below Post will not be validated by default.

post = new Post({
    id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f',
    title: 'The blog post',
    createdAt: new Date().toISOString(),
    comments: [
        {
            id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148b',
            body: 'First!',
            children: [
                {
                    id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148d',
                    body: 'Second!'
                }
            ]
        }
    ]
});

// Or use getInstance. Only Post will be validated.

post = Post.getInstance({
    id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148f',
    title: 'The blog post',
    created_at: new Date().toISOString(),
    comments: [
        {
            id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148b',
            body: 'First!',
            children: [
                {
                    id: '3ed44ac2-4dd8-4a2a-9aaa-879e4a44148d',
                    body: 'Second!'
                }
            ]
        }
    ]
}) as Post;

// In all these cases (assuming strictNullChecks is temporarily disabled :)):

post.toObject().comments[0].children[0].body === 'Second!';

```
