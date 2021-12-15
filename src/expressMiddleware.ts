import { AsyncLogger, Logger, LoggerMiddleWare } from ".";
import { Request, Response, NextFunction } from "express";

export type RequestHydrator<LoggerType extends Logger> = (logger: LoggerType, request: Request) => LoggerType;

/**
 * Creates an express middleware
 * 
 * @param logger 
 * @param requestHydrator 
 * @returns 
 */
export const createMiddleware = <LoggerType extends Logger>(
	logger: AsyncLogger<LoggerType>,
	requestHydrator?: RequestHydrator<LoggerType>
) => {
	return (request: Request, response: Response, next: NextFunction) => {
		logger.runWithNewContext(() => next(), (logger) => {
			if (requestHydrator) {
				return requestHydrator(logger, request);
			}
			return logger;
		});
	}
}