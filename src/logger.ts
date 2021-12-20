import { AsyncLoggerManager, LoggerMiddleWare } from './manager';

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

	log?(...data: any[]): void;
	log?(message?: any, ...optionalParams: any[]): void;
	log?(message?: any, ...optionalParams: any[]): void;

	trace(...data: any[]): void;
	trace(message?: any, ...optionalParams: any[]): void;
	trace(message?: any, ...optionalParams: any[]): void;


	warn(...data: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
}

export class AsyncLogger<LoggerType extends Logger> implements Logger {
	private readonly logger: LoggerType;
	private manager: AsyncLoggerManager<LoggerType>;

	constructor(
		logger?: LoggerType,
		spawner?: LoggerMiddleWare<LoggerType>
	) {
		this.logger = logger ?? console as any;
		this.manager = new AsyncLoggerManager(this.logger);
		if (spawner) {
			this.manager.onSpawn(spawner);
		}
	}

	public onSpawn(spawner: (logger: LoggerType) => LoggerType) {
		this.manager.onSpawn(spawner);
	}

	public runWithNewContext(cb: () => unknown, once?: LoggerMiddleWare<LoggerType>) {
		this.manager.run(cb, once);
	}

	debug(...data: any[]): void;
	debug(message?: any, ...optionalParams: any[]): void;
	debug(message?: any, ...optionalParams: any[]): void;
	debug(message?: any, ...optionalParams: any[]): void {
		this.manager.getLogger().debug(...arguments);
	}
	error(...data: any[]): void;
	error(message?: any, ...optionalParams: any[]): void;
	error(message?: any, ...optionalParams: any[]): void;
	error(message?: any, ...optionalParams: any[]): void {
		this.manager.getLogger().error(...arguments);
	}
	info(...data: any[]): void;
	info(message?: any, ...optionalParams: any[]): void;
	info(message?: any, ...optionalParams: any[]): void;
	info(message?: any, ...optionalParams: any[]): void {
		this.manager.getLogger().info(...arguments);
	}
	log(...data: any[]): void;
	log(message?: any, ...optionalParams: any[]): void;
	log(message?: any, ...optionalParams: any[]): void;
	log(message?: any, ...optionalParams: any[]): void {
		const logger = this.manager.getLogger();
		if (logger.log) {
			logger.log(...arguments);
		}
		logger.info(...arguments);
	}
	trace(...data: any[]): void;
	trace(message?: any, ...optionalParams: any[]): void;
	trace(message?: any, ...optionalParams: any[]): void;
	trace(message?: any, ...optionalParams: any[]): void {
		this.manager.getLogger().trace(...arguments);
	}
	warn(...data: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void;
	warn(message?: any, ...optionalParams: any[]): void {
		this.manager.getLogger().warn(...arguments);
	}

  public getLogger(): LoggerType {
    return this.manager.getLogger();
  }
}
