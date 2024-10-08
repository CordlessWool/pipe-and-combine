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

This library contains functions for sync and async usage.

### Pipe

The usual `pipe` function will simply chain your functions together.
pipeAsync` will also wait for the previous function to finish before calling the next one.

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
const double = async (x: number) => x * 2;
const increment = async (x: number) => Promise.resolve(x + 1);
const square = async (x: number) =>
  new Promise<number>((resolve) => setTimeout(() => resolve(x * x), 100));
const toStr = async (x: number) => x.toString();

const pipeline = asyncPipe(double, increment, square, increment, toStr);
expect(pipeline(2)).resolves.toBe("26");
```

### Combine

> async version currently not available

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
