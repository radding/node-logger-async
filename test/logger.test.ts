import { AsyncLogger, Logger } from "../src/logger";

const createMockedLogger = () => ({
	log: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
	trace: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
}) as Logger;

describe("AsyncLogger", () => {
	it("constructs correctly", () => {
		const mockedLogger = createMockedLogger();
		const underTest = new AsyncLogger(mockedLogger);
		underTest.info(1);
		expect(mockedLogger.info).toBeCalledWith(1);
		underTest.log(2);
		expect(mockedLogger.log).toBeCalledWith(2);
		underTest.error(3);
		expect(mockedLogger.error).toBeCalledWith(3);
		underTest.warn(4);
		expect(mockedLogger.warn).toBeCalledWith(4);
		underTest.trace(5);
		expect(mockedLogger.trace).toBeCalledWith(5);
		underTest.debug(6);
		expect(mockedLogger.debug).toBeCalledWith(6);
	});

	it("spawns a new logger properly", async () => {
		const mockedLogger = createMockedLogger();
		const mockedLogger2 = createMockedLogger();
		const underTest = new AsyncLogger(mockedLogger, () => mockedLogger2);
		await new Promise<void>(res => {
			underTest.runWithNewContext(() => {
				underTest.log("this is a test");
				res();
			});
		});
		expect(mockedLogger.log).not.toBeCalled();
		return expect(mockedLogger2.log).toBeCalled();
	});

	it("adds middleware properly", async () => {
		const mockSpawner = jest.fn((obj) => obj);
		const mockedLogger = createMockedLogger();
		const underTest = new AsyncLogger(mockedLogger, mockSpawner);
		underTest.onSpawn(mockSpawner);
		await new Promise<void>(res => {
			underTest.runWithNewContext(() => {
				underTest.log("this is a test");
				res();
			});
		});
		return expect(mockSpawner).toBeCalledTimes(2);
	});
});