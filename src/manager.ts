import { AsyncLocalStorage, executionAsyncId } from 'async_hooks';
import { Logger } from './logger';

export type LoggerMiddleWare<LoggerType extends Logger> = (logger: LoggerType) => LoggerType;

/**
 * AsyncLoggerManager manages the logger's context. 
 */
export class AsyncLoggerManager<LoggerType extends Logger> {
	private readonly asyncStorage: AsyncLocalStorage<LoggerType>;
	private middleWares: LoggerMiddleWare<LoggerType>[];
	constructor(private readonly logger: LoggerType, ...middleWares: LoggerMiddleWare<LoggerType>[]) {
		this.asyncStorage = new AsyncLocalStorage();
		this.middleWares = middleWares ?? [];
	}

	/**
	 * Before we spawn a new context, we call the onSpawn callback. This allows user's to inject context
	 * into their logs. The spawner takes a logger, and then returns a logger with the context they 
	 * want.
	 * @param onSpawn the spawn function
	 */
	public onSpawn(onSpawn: LoggerMiddleWare<LoggerType>) {
		this.middleWares.push(onSpawn)
	}

	/**
	 * Run the callback inside of the logger context.
	 * @param cb the callback to run in the context
	 */
	public run(cb: () => unknown, once?: LoggerMiddleWare<LoggerType>) {
		let logger = this.middleWares.reduce((acc, middleWare) => middleWare(acc), this.logger);
		if (once) {
			logger = once(logger);
		}
		this.asyncStorage.run(logger, cb);
	}

	/**
	 * Gets the logger in the current context
	 * @returns The current logger to use
	 */
	public getLogger(): LoggerType {
		return this.asyncStorage.getStore() ?? this.logger;
	}
}