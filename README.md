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
