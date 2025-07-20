import { LogLevel, type ILogger } from "@sapphire/framework";
import logger from "$shared/logger";

/**
 * {@link ILogger} for Sapphire that wraps the Logtape logger.
 */
export default class Logger implements ILogger {
	has(_: LogLevel): boolean {
		return true;
	}

	trace(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
		logger.trace(strings, ...values);
	}

	debug(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
		logger.debug(strings, ...values);
	}

	info(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
		logger.info(strings, ...values);
	}

	warn(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
		logger.warn(strings, ...values);
	}

	error(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
		for (const value of values) {
			if (value instanceof Error) {
				logger.error(strings, ...values);
				logger.error(`${value.stack ?? value.message}`);
				return;
			}
		}
	}

	fatal(strings: TemplateStringsArray, ...values: readonly unknown[]): void {
		logger.fatal(strings, ...values);
	}

	write(
		level: LogLevel,
		strings: TemplateStringsArray,
		...values: readonly unknown[]
	): void {
		switch (level) {
			case LogLevel.Trace: {
				this.trace(strings, ...values);
				break;
			}

			case LogLevel.Debug: {
				this.debug(strings, ...values);
				break;
			}

			case LogLevel.Info: {
				this.info(strings, ...values);
				break;
			}

			case LogLevel.Warn: {
				this.warn(strings, ...values);
				break;
			}

			case LogLevel.Error: {
				this.error(strings, ...values);
				break;
			}

			case LogLevel.Fatal: {
				this.fatal(strings, ...values);
				break;
			}

			case LogLevel.None: {
				break;
			}
		}
	}
}
