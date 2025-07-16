# pipe-and-combine

**Readable code through functional composition**

A TypeScript-first pipe library that makes function composition clean and type-safe. Features automatic async/sync detection and advanced object transformation capabilities.

```typescript
import { pipe } from "pipe-and-combine";

const pipeline = pipe(add(1), multiply(2), subtract(1));
const result = pipeline(3); // result -> 7
```

## Why Functional Composition?

Traditional nested function calls become hard to read as complexity grows:

```typescript
// Hard to read - inside-out execution
const result = toString(divide(subtract(multiply(add(input, 1), 2), 1), 3));

// Much clearer - left-to-right execution
const pipeline = pipe(add(1), multiply(2), subtract(1), divide(3), toString());
const result = pipeline(input);
```

**pipe-and-combine** solves common problems in function composition:

- **Readability**: Code flows naturally from left to right
- **Type Safety**: Full TypeScript inference through the entire pipeline
- **Async Handling**: Automatically detects and handles mixed sync/async functions
- **Object Composition**: Smart merging for partial object updates

## Installation

```bash
npm install pipe-and-combine
```

## Core Features

### 🔗 Pipe Function (Essential)

Chain functions together without nesting. The pipe function automatically detects and handles async/sync functions, eliminating the need to manually wrap promises or use different pipe functions for different scenarios.

**Sync Functions:**

```typescript
const inc = (by: number) => (x: number) => x + by;
const multiplyBy = (by: number) => (x: number) => x * by;
const toStr = () => (x: number) => x.toString();

const pipeline = pipe(inc(2), multiplyBy(7), toStr());
expect(pipeline(2)).toBe("28"); // (2+2) * 7 = "28"
```

**Async Functions:**

```typescript
// Properly typed async functions
const fetchUserData = async (id: number): Promise<User> => {
  const response = await fetch(`/users/${id}`);
  const data = await response.json();
  return data as User; // Type assertion needed for fetch
};

const validateUser = async (
  user: User
): Promise<User & { isValid: boolean }> => {
  // Some async validation logic
  const isValid = await checkUserInDatabase(user.id);
  return { ...user, isValid };
};

const pipeline = pipe(fetchUserData, validateUser);
const result = await pipeline(123); // Returns Promise<User & { isValid: boolean }>
```

**Mixed Async/Sync - The Real Power:**

```typescript
// More realistic example with proper types
type User = { id: number; name: string; email: string };

const processUser = pipe(
  (id: number) => ({ userId: id }), // sync: { userId: number }
  async (data) => {
    // async function
    const user = await getUserFromDB(data.userId); // returns Promise<User>
    return user;
  },
  (user: User) => ({ ...user, processed: true }), // sync: User & { processed: boolean }
  async (user) => {
    // async save
    await saveAuditLog(user.id);
    return user;
  },
  (user) => user.id // sync: number
);

// pipe automatically returns Promise<number> because async functions are detected
const userId = await processUser(123);
```

**Why This Matters:**

- **No Manual Promise Handling**: Don't worry about wrapping sync functions in Promise.resolve()
- **Type Safety**: TypeScript correctly infers Promise<T> when async functions are present
- **Performance Optimization**: Functions are composed at build time, then executed efficiently at runtime
- **Memory Efficiency**: Sync functions run synchronously until the first async function - no unnecessary Promise overhead
- **Flexibility**: Add async functions to existing sync pipelines without refactoring

```typescript
// Performance example: Pipeline created once, used many times
const processUserPipeline = pipe(
  (x: number) => x * 2, // sync
  (x: number) => x + 1, // sync
  (x: number) => x.toString() // sync
);

// Efficient: Pipeline is already composed, just execute
const results = [1, 2, 3, 4, 5].map(processUserPipeline);

// Mixed pipeline: sync functions execute immediately, then async
const mixedPipeline = pipe(
  (x: number) => x * 2, // sync - executes immediately
  (x: number) => x + 1, // sync - executes immediately
  async (x: number) => {
    // async - from here Promise overhead starts
    await delay(100);
    return x.toString();
  }
);
const result = await mixedPipeline(5); // Only awaits from the async function onward
```

### 🎯 Object Enrichment (Intermediate)

**Why you need this:** When working with objects in pipes, you often want to add properties while keeping existing ones. Regular functions replace the entire object, losing your original data.

**Simple Example:**

```typescript
import { pipe, enrich } from "pipe-and-combine";

// Without enrich - data gets replaced
const addAge = (user: any) => ({ age: 25 });
const pipeline1 = pipe(addAge);
const result1 = pipeline1({ id: 1, name: "Max" });
// Result: { age: 25 } - Lost id and name!

// With enrich - data gets merged
const addAgeEnriched = pipe(enrich(() => ({ age: 25 })));
const result2 = addAgeEnriched({ id: 1, name: "Max" });
// Result: { id: 1, name: "Max", age: 25 } - Everything preserved!
```

**The Real Power - Generic Functions:**

The main challenge comes with **generic functions** - TypeScript loses track of the original generic type information in standard pipes.

```typescript
// This generic function loses type information in normal pipes
const addFullName = <T extends { first: string; last: string }>(user: T) => ({
  fullName: `${user.first} ${user.last}`,
});

const pipeline = pipe(addFullName);
const user = { id: 1, first: "Max", last: "Smith", email: "max@example.com" };
const result = pipeline(user);
// Result type: { fullName: string } - Lost id, first, last, email!
```

**The Solution:** `enrich()` preserves generic type information through type branding:

```typescript
// With enrich() - preserves the full generic type
const addFullName = enrich(
  <T extends { first: string; last: string }>(user: T) => ({
    fullName: `${user.first} ${user.last}`,
    initials: `${user.first[0]}.${user.last[0]}.`,
  })
);

const pipeline = pipe(addFullName);
const result = pipeline(user);
// Result type: {
//   id: number;
//   first: string;
//   last: string;
//   email: string;
//   fullName: string;
//   initials: string;
// }
```

**Advanced Pipeline Example:**

```typescript
// Complex pipeline with property dependencies and transformations
const addStartupTime = (time: Date = new Date()) =>
  enrich(() => ({ startup: time }));

const timeDiff = () =>
  enrich((data: { startup: Date; current: Date }) => ({
    diff: new Date(data.current.getTime() - data.startup.getTime()),
  }));

const currentToString = () =>
  enrich((data: { current: Date }) => ({
    current: data.current.toString(), // Overwrites current: Date with current: string
  }));

const addHello = () => enrich(() => ({ hello: "test" }));

const complexPipeline = pipe(
  addStartupTime(), // + { startup: Date }
  addDate("current"), // + { current: Date }
  timeDiff(), // + { diff: Date } (uses startup + current)
  currentToString(), // current: Date -> current: string
  addHello(), // + { hello: string }
  addDate("done"), // + { done: Date }
  omit("hello") // - { hello } (removed)
);

const result = complexPipeline({}); // Start with empty object

// TypeScript infers exact result type:
// {
//   startup: Date;
//   current: string;  // Note: transformed from Date to string
//   diff: Date;
//   done: Date;
// }
```

**Important Notes:**

- **`enrich()` only adds or overwrites** - it cannot remove properties
- **For property removal** use `omit()` and `pick()` utilities
- **Property dependencies** work seamlessly - later enrich functions can access properties added by earlier ones
- **Type transformations** are supported - you can change a property's type by overwriting it

**Why This Matters:**

- **Complex Type Dependencies**: Functions can depend on properties added by previous enrichment steps
- **Property Transformation**: Change property types by overwriting (Date → string in the example)
- **Type Safety Through Pipelines**: TypeScript tracks all changes through complex multi-step transformations
- **Merge + Removal Workflow**: Use `enrich()` to build up objects, then `omit()`/`pick()` to clean up
- **Reusable Generic Functions**: Write enrichment functions that work with any compatible type structure

## API Reference

### pipe(...functions)

Creates a pipeline that executes functions left-to-right.

**Features:**

- Automatic async/sync detection
- Full TypeScript type inference
- Unlimited function composition

```typescript
// Basic usage - creates a reusable pipeline
const pipeline = pipe(fn1, fn2, fn3);
const result = pipeline(input);

// Direct execution with run() - executes immediately
const result = run(input, fn1, fn2, fn3);
```

**Key Difference:**

- **`pipe()`**: Creates a reusable function (compose at build time, execute at runtime)
- **`run()`**: Executes immediately (for one-time usage)

### enrich(fn)

Wraps a function to merge its output with the input object.

```typescript
const addMetadata = enrich((user: { name: string }) => ({
  createdAt: new Date(),
  slug: user.name.toLowerCase(),
}));

const pipeline = pipe(addMetadata);
const result = pipeline({ id: 1, name: "Max" });
// Result: { id: 1, name: "Max", createdAt: Date, slug: "max" }
```

### combine(...functions)

Calls all functions with the same arguments and returns an array of results.

```typescript
const add = (a: number, b: number) => a + b;
const multiply = (a: number, b: number) => a * b;
const subtract = (a: number, b: number) => a - b;

const calculator = combine(add, multiply, subtract);
expect(calculator(5, 3)).toEqual([8, 15, 2]);
```

## Utility Functions

### apply(fn)

Applies an array as arguments to a function.

```typescript
const getArgs = () => ["hello", 3];
const repeat = (text: string, times: number) => text.repeat(times);

const pipeline = pipe(getArgs, apply(repeat));
expect(pipeline()).toBe("hellohellohello");
```

### omit(keys) & pick(keys)

Remove or select specific properties from objects. These work seamlessly with `enrich()` for complete object transformation workflows.

```typescript
import { pipe, enrich, omit, pick } from "pipe-and-combine";

const user = {
  id: 1,
  name: "Max",
  email: "max@example.com",
  password: "secret123",
  internal: "system-data",
};

// Remove sensitive properties
const cleanUserPipeline = pipe(omit("password", "internal"));
const cleanUser = cleanUserPipeline(user);
// Result: { id: 1, name: "Max", email: "max@example.com" }

// Select only specific properties
const publicUserPipeline = pipe(pick("id", "name"));
const publicUser = publicUserPipeline(user);
// Result: { id: 1, name: "Max" }

// Combine with enrichment for complex transformations
const processUserPipeline = pipe(
  enrich(addTimestamps), // + { createdAt, updatedAt }
  enrich(addPermissions), // + { permissions: string[] }
  pick("id", "name", "email", "permissions", "createdAt") // Select final fields
);
const processedUser = processUserPipeline(user);
// Result: { id: 1, name: "Max", email: "max@example.com", permissions: string[], createdAt: Date }
```

**Type Safety:** Both `omit()` and `pick()` maintain full TypeScript type safety - the result types correctly reflect which properties are removed or selected.

### map(fn)

Transform arrays within pipes.

```typescript
pipe(
  [1, 2, 3],
  map((x) => x * 2), // [2, 4, 6]
  map((x) => x.toString()) // ["2", "4", "6"]
);
```

## Advanced Usage

## Advanced Usage

### Type-Safe Pipeline Preparation

When you need to ensure specific input/output types across a pipeline, use `preparePipe`:

```typescript
// Pre-define input/output types for better type safety
const typedPipe = preparePipe<[number], string>();
const pipeline = typedPipe(
  (n: number) => n * 2,
  (n: number) => n.toString(),
  (s: string) => s.toUpperCase()
);

// Multiple inputs with complex types
type UserInput = { email: string; password: string };
type ProcessedUser = { id: string; email: string; hashedPassword: string };

const userProcessor = preparePipe<[UserInput], ProcessedUser>();
```

### Complex Object Transformations

Combine multiple enrichment functions for sophisticated object building:

```typescript
type User = { id: number; name: string };
type APIResponse = { data: User; timestamp: number };

const processAPIResponsePipeline = pipe(
  // Start with API response
  (response: APIResponse) => response.data,

  // Add computed properties
  enrich((user: User) => ({
    displayName: user.name.toUpperCase(),
    slug: user.name.toLowerCase().replace(/\s+/g, "-"),
  })),

  // Add metadata
  enrich((user: User) => ({
    metadata: {
      processedAt: new Date(),
      version: "1.0",
    },
  })),

  // Add validation status
  enrich(async (user: User & { displayName: string }) => {
    const isValid = await validateUserName(user.displayName);
    return {
      validation: {
        isValid,
        checkedAt: new Date(),
      },
    };
  }),

  // Final transformation
  (enrichedUser) => ({
    ...enrichedUser,
    status: enrichedUser.validation.isValid ? "active" : "pending",
  })
);

// TypeScript infers the complete final type automatically
const result = await processAPIResponsePipeline(apiResponse);
```

### Performance Optimizations

```typescript
// Standard imports are tree-shakable if you only use what you import
import { pipe, enrich, omit } from "pipe-and-combine";

// Reuse pipeline definitions for better performance
const userEnrichmentPipeline = pipe(
  enrich(addTimestamps),
  enrich(addMetadata),
  enrich(generateSlug)
);

// Compose with other pipelines
const fullUserPipeline = pipe(
  validateUser,
  userEnrichmentPipeline,
  saveToDatabase
);

// Sync-only pipelines run without Promise overhead
const fastProcessingPipeline = pipe(
  normalizeInput,
  enrich(addDefaults),
  validateFields
); // No async functions = immediate execution

// Use pipelines multiple times
const processedUsers = users.map(fullUserPipeline);
```

## Why pipe-and-combine?

**Compared to other pipe libraries:**

- **fp-ts**: Requires deep functional programming knowledge, heavy learning curve, and doesn't handle async/sync mixing automatically
- **Ramda**: Not TypeScript-first, limited object composition capabilities
- **Lodash/flow**: No automatic async detection, basic type inference
- **Native JavaScript**: No built-in pipe operator (still in proposal stage)

**pipe-and-combine advantages:**

- **TypeScript-First**: Designed from the ground up for excellent TypeScript support
- **Automatic Async/Sync**: Seamlessly mix synchronous and asynchronous functions
- **Object-Aware**: Smart object merging with `enrich()` for complex data transformations
- **Zero Dependencies**: Lightweight and fast, no external dependencies
- **Tree-Shakable**: Import only the functions you actually use
- **Intuitive API**: Easy to learn, no functional programming background required
- **Type Safety**: Full type inference through complex pipelines and object transformations

**Real-world use case:**

```typescript
// API endpoint handler with validation, transformation, and database saving
const createUserPipeline = pipe(
  validateUserInput, // { email: string, name: string }
  enrich(generateId), // + { id: string }
  enrich(addTimestamps), // + { createdAt: Date, updatedAt: Date }
  enrich(hashPassword), // + { hashedPassword: string }
  omit("password"), // Remove plain text password
  saveToDatabase, // async database operation
  (user) => ({ success: true, user }) // Format response
);

// Use the pipeline for each request
const result = await createUserPipeline(requestBody);
// TypeScript knows the exact shape at each step
```

## Changelog

See [CHANGELOG.md](https://github.com/CordlessWool/pipe-and-combine/blob/main/CHANGELOG.md) for version history.
