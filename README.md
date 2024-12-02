# pipe and combine

Readability is important because code is read more often than it is written.
This library contains a pipe function to call functions without nesting them.
by writing them in a nice way without nesting and taking care of getting the value and passing it to the next function.

```ts
import { pipe } from "pipe-and-combine";

const pipeline = pipe(add(1), multiply(2), subtract(1));

const result = pipeline(3); // result -> 7
```

## Installation

```bash
    npm install pipe-and-combine
```

## Usage

The main function this library provides is `pipe` and `combine`, but there are some helper functions to make it easier to use.
They currently not all documentend here, but will follow soon.

### Pipe

The usual `pipe` function will simply chain your functions together.
It automatically detects if the functions are async or not and handles the return value accordingly.
So with Version 0.7.x you have to think less about async or sync pipe functions.

```ts
// general functions
const inc = (by: number) => (x: number) => x + by;
const dec = (by: number) => (x: number) => x - by;
const multiplyBy = (by: number) => (x: number) => x * by;
const divideBy = (by: number) => (x: number) => x / by;
const toStr = () => (x: number) => x.toString();

// prepare the pipeline
const pipeline = pipe(inc(2), multiplyBy(7), dec(7), divideBy(3), toStr());

// execute the pipeline
expect(pipeline(2)).toBe("7");
```

```ts
const double = (x: number) => x * 2;
const increment = async (x: number) => Promise.resolve(x + 1);
const square = async (x: number) =>
  new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
const toStr = (x: number) => x.toString();

const pipeline = pipe(double, increment, square, increment, toStr);
await expect(pipeline(2)).resolves.toBe("26");
```

#### Pre prepare the pipe

While `pipe` just takes the Input and Output of the functions,
you can use `preparePipe` to prepare the pipe with the input and output value.

```ts
// in this case the first function needs to takes a number and the last function returns a string
const pipe = preparePipe<[number], string>();
// but you can also define multiple input values
const pipe = preparePipe<[number, string], string>();
// without types it is the same as above
const pipe = preparePipe();
// to only define one of the set the other to any
const pipe = preparePipe<any, string>();
```

### Combine

> async is currently not implemented but will follow soon

The `combine' function calls all functions with the same input and returns an array of results.

```ts
const add = (a: number, b: number) => a + b;
const multiply = (a: number, b: number) => a * b;
const divide = (a: number, b: number) => a / b;
const other = (a: number, b: number) => (a - b).toString();
const str = (a: number) => a.toString();

const c = combine(add, multiply, divide, other, str);
expect(c(1, 2)).toEqual([3, 2, 0.5, "-1", "1"]);
```

### Helper functions

#### apply

`apply` will take a function and apply an array returned by an other function as arguments.

```ts
const init = () => ["text", 5];
const repeat = (text: string, times: number) => text.repeat(times);
const pipeline = pipe(init, apply(repeat));
expect(pipeline()).toBe("texttexttexttexttext");
```

#### map

`map` could iterate over an array and call a function for each element, like `Array.prototype.map`.

#### addDate (generic) (experimental)

This function adds a date to an object and returns the object with the date.
It has a required parameter `key` to define the name of key where the date should be stored.

```ts
pipe(init(), addDate("createdAt"));
// addDate will add a filed createdAt to the object given by init
```

#### omit

Removes one or more keys from an object.

```ts
pipe(omit("text", "createdAt"));
```

#### pick

Picks one or more keys from an object.

```ts
pipe(pick("text", "createdAt"));
```

## Experimental

With Version 0.7.x we introduced a new experimental feature to handle generic types.
This is a very powerful feature, but also very complex to get typesafe.

```ts
import { pipe, addDate, g } from "pipe-and-combine";
type InitObject = { text: string };
const init = () => () => ({ text: "my cool data object " });
const count = (word: string) =>
  g((data: { text: string }) => {
    // just a simple example to show how to handle generic types
    return {
      amount: data.text.split(word).length - 1;
    }
  };

const pipeline = pipe(init, addDate('createdAt'), count("cool"));
```

### What is the `g` function?

At least it do a merge of the input and the output of the given function, but on the type level it do much more.
It brand the function to know how to henadle the type. Because otherwise information about the type is lost.

## Changelog

You can find the changelog in the [CHANGELOG.md](https://github.com/CordlessWool/pipe-and-combine/blob/main/CHANGELOG.md) file.
