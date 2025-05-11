# pipe-and-combine

## 0.8.0

### Minor Changes

- c6d5ca3: Add run function and return generic chain only if first function is of type gFunction
- e8ed4e3: make pipe itself generic
- b1e7256: add async compatibility to combine

### Patch Changes

- a7f5755: export run function

## 0.8.0-next.2

### Patch Changes

- a7f5755: export run function

## 0.8.0-next.1

### Minor Changes

- c6d5ca3: Add run function and return generic chain only if first function is of type gFunction

## 0.8.0-next.0

### Minor Changes

- e8ed4e3: make pipe itself generic

## 0.7.11

### Patch Changes

- 5d335ed: allow to call G function without value
  allow predefiened values in g functions

## 0.7.10

### Patch Changes

- d63b206: - Remove GMergeAsync and inlcude it in GMerge
  - Improve HasAnyAsync function to handle GMerge with Promise
  - g do not need a retrun type of the given function

## 0.7.9

### Patch Changes

- a995c0f: improve types for g function. Allow to use g functions as first in pipe.

## 0.7.8

### Patch Changes

- 43a360a: add d.cts type for cjs exports

## 0.7.7

### Patch Changes

- 2e1d06d: add .js to all imports

## 0.7.6

### Patch Changes

- cc37e60: export helpers/index instead of helpers to get correct types

## 0.7.5

### Patch Changes

- 7bf4abc: add exec function (experimantal and not documented)

## 0.7.4

### Patch Changes

- c35c2b9: add missing exports of addDate, omit, pick

## 0.7.3

### Patch Changes

- 8fc8a15: Rename types.d.ts to types.ts to get error response. Rollup needs it propably to build up types
- b366eeb: Add JSDocs for omit and pick

## 0.7.2

### Patch Changes

- 985b262: Fix: Rollup didn't move type.d.ts to dist folder

## 0.7.1

### Patch Changes

- ded0d52: Add a `pick` & `omit` helper to remove elements from a object

## 0.7.0

### Minor Changes

- ab77ab4: - Implement a generic wrapper function to handle generic types.
  - Reduce complexity, by combine async and non-async function.
