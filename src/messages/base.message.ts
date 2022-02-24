import { MessageTransferGenerator, BaseLogger } from "..";

export abstract class BaseMessage {
	public constructor(protected id: string) {}

	public *iterator(logger: BaseLogger): MessageTransferGenerator {
		logger.logLastId(this.id);
		yield* this._baseIterator(logger);
	}

	protected abstract _baseIterator(
		logger: BaseLogger
	): MessageTransferGenerator;
}
