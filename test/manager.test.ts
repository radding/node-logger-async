import { Logger } from "../src/logger";
import { AsyncLoggerManager } from "../src/manager";
const createMockedLogger = () => ({
	log: jest.fn(),
}) as any as Logger;

describe("The AsyncLoggerManager", () => {
	it("constructs fine", () => {
		new AsyncLoggerManager(console as any);
	});

	it("returns the default logger if not in the context", () => {
		const manager = new AsyncLoggerManager(console as any);
		expect(manager.getLogger()).toBe(console);
	});

	it("calls the spawn function on run", async () => {
		const mockSpawn = jest.fn((logger) => {
			expect(logger).toBe(console);
			return logger;
		});
		const manager = new AsyncLoggerManager(console as any, mockSpawn);
		expect(mockSpawn).not.toBeCalled();
		await new Promise<void>((res) => {
			manager.run(() => {
				res();
			});
		});
		return expect(mockSpawn).toBeCalled();
	});

	it("uses the correct logger in the context", async () => {
		const mockedLogger = createMockedLogger();
		const manager = new AsyncLoggerManager(console as any, () => {
			return mockedLogger;
		});
		expect(manager.getLogger()).toBe(console);
		await new Promise<void>((res) => {
			manager.run(() => {
				expect(manager.getLogger()).toBe(mockedLogger);
				mockedLogger.log("hello");
				res();
			});
		});
		return expect(mockedLogger.log).toBeCalled();
	});

	it("it adds middlewares", async () => {
		const mockSpawn = jest.fn();
		const mockSpawn2 = jest.fn();
		const manager = new AsyncLoggerManager(console as any, mockSpawn);
		expect(mockSpawn).not.toBeCalled();
		expect(mockSpawn2).not.toBeCalled();
		manager.onSpawn(mockSpawn2);
		await new Promise<void>((res) => {
			manager.run(() => {
				res();
			});
		});
		expect(mockSpawn).toBeCalled();
		return expect(mockSpawn2).toBeCalled();
	});
})