# AsyncNodeLogger

The Logger Util to log inside of async operations.

## Why?

Have you ever wished that you can have a logger that is unique inside of a callback or promise
chain? Ever wanted to be able segment portions of your logs based on asynchronous operations?
Well with this library you can! AsyncNodeLogger allows you to define a logger per async operations
and will look up which logger to use based on context. It barely even feels like you are using
anything different!

## Installation

`npm i node-logger-async`

## Usage

### Basic usage

This usage is the most basic of all usages. If you use this library like this, this is equivalent of
using `console`.

```typescript
import { AsyncLogger } from "async-node-logger";

const logger = new AsyncLogger();
logger.info("This is a message from a test"); // Same as calling console.info.
```

### Slightly more complicated example

This example shows you how to set up a logger to add context inside of a callback chain.
This logger will generate a random ID when ever `runWithNewContext` is called and make
the message be formatted with that id in the message.

```typescript
import { AsyncLogger } from "async-node-logger";

const logger = new AsyncLogger(console, (logger: Console) => {
  const id = Math.floor(Math.random() * 1000); // assume random returns 1
  return {
    info: (...args: any[]) => logger.info(`[ID- ${id}]:`, ...args),
    log: (...args: any[]) => logger.log(`[ID- ${id}]:`, ...args),
    warn: (...args: any[]) => logger.warn(`[ID- ${id}]:`, ...args),
    error: (...args: any[]) => logger.error(`[ID- ${id}]:`, ...args),
    debug: (...args: any[]) => logger.debug(`[ID- ${id}]:`, ...args),
    trace: (...args: any[]) => logger.trace(`[ID- ${id}]:`, ...args),
  }
});
logger.info("This is a message from a test"); // outputs "This is a message from a test"
const callDB = async () => logger.info('calling db'); // outputs "[ID- 1] calling db"
const doSomethingAsync = async () => {
  logger.info('do something async'); // outputs "[ID- 1] do something async"
  await callDB();
}
logger.runWithNewContext(doSomethingAsync);
logger.info("done"); //outputs "Done"; 
```

### Usage with other loggers

You don't have to use console. You can use something like [bunyan](https://github.com/trentm/node-bunyan) (my personal favorite logging library), in order to perform logging for you. This allows you to use more
rich loggers and really customize what you log.

```typescript
import { AsyncLogger } from "async-node-logger";
import bunyan from "bunyan";

const bunyanLogger = bunyan.createLogger({
  name: "myapp",
});

const logger = new AsyncLogger(bunyanLogger, (logger: bunyan) => {
  const id = Math.floor(Math.random() * 1000); // assume random returns 1
  return logger.child({
    id,
  });
});
logger.info("This is a message from a test"); // uses main bunyanLogger; 
const callDB = async () => logger.info('calling db'); // uses child bunyan logger
const doSomethingAsync = async () => {
  logger.info('do something async'); // uses child bunyan logger 
  await callDB();
}
logger.runWithNewContext(doSomethingAsync);
logger.info("done"); // uses main bunyanLogger; 
```

## Documentation

### `Logger`

Logger is an interface that defines the methods that loggers use to write to loggers. It defines the
`info`, `warn`, `error`, `debug`, `trace`, and `log` methods.

```typescript
export interface Logger {
 debug(...data: any[]): void;
 debug(message?: any, ...optionalParams: any[]): void;
 debug(message?: any, ...optionalParams: any[]): void;

 error(...data: any[]): void;
 error(message?: any, ...optionalParams: any[]): void;
 error(message?: any, ...optionalParams: any[]): void;

 info(...data: any[]): void;
 info(message?: any, ...optionalParams: any[]): void;
 info(message?: any, ...optionalParams: any[]): void;

 log(...data: any[]): void;
 log(message?: any, ...optionalParams: any[]): void;
 log(message?: any, ...optionalParams: any[]): void;

 trace(...data: any[]): void;
 trace(message?: any, ...optionalParams: any[]): void;
 trace(message?: any, ...optionalParams: any[]): void;


 warn(...data: any[]): void;
 warn(message?: any, ...optionalParams: any[]): void;
 warn(message?: any, ...optionalParams: any[]): void;
}
```

### `LoggerMiddleware<LoggerType extends Logger>`

This defines a function that takes a logger, and then returns a logger. This logger can either be
the same as the logger that was passed in, or a different logger. You can use this to define a way
to hydrate context when a new logger is created.

### `AsyncLogger<LoggerType extends Logger>`

The AsyncLogger is a facade that manages the context for async logging. It passes calls to the logging
methods to the chosen logger. The LoggerType is any type that satisfies the `Logger` Interface.

#### `constructor(logger: LoggerType, middleware: LoggerMiddleware<LoggerType>)`

Creates the AsyncLogger. The logger is the logger to use for actually performing the logging. The
middleware is called right before a new async context is created.

#### `public onSpawn(spawner: LoggerMiddleware<LoggerType>)`

Adds a new middleware to the pipeline when a new logger is created for an async context.

#### `runWithNewContext(cb: () => unknown, once?: LoggerMiddleWare<LoggerType>)`

Runs the callback with a new context that has a logger bound to it. You can use the once parameter
to run this middleware only for this single context.

### Express middleware

We have an easy to use middleware for express. You can use this middleware to spawn new contexts
for you and to add some identifying information about the request ID. For example a request ID, a
user ID, or the request path.

```typescript
import { AsyncLogger, createMiddleware } from "async-node-logger";
import bunyan from "bunyan";
import express from "express";

const bunyanLogger = bunyan.createLogger({
  name: "myapp",
});

const logger = new AsyncLogger(bunyanLogger);

const app = express();
app.use(createMiddleware(logger, (logger, request: express.Request) => {
  const requestID = generateUniqueID();
  return logger.child({
    requestID,
    path: request.originalUrl,
  });
}));

app.get("/hello-world", (_, resp) => {
  logger.info("I am here") // This will have a unique ID, and the original request path for the request
});

app.listen(3000, () => {
  logger.info("listening on port 3000"); // Will be top level code
})
```

Type Definition:
`<LoggerType extends Logger>( logger: AsyncLogger<LoggerType>, requestHydrator?: RequestHydrator<LoggerType> => RequestHandler`;
