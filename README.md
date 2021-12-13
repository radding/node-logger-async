# AsyncNodeLogger

The Logger Util to log inside of async operations.

## Why?

Have you ever wished that you can have a logger that is unique inside of a callback or promise
chain? Ever wanted to be able segment portions of your logs based on asynchronous operations?
Well with this library you can! AsyncNodeLogger allows you to define a logger per async operations
and will look up which logger to use based on context. It barely even feels like you are using
anything different!

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
