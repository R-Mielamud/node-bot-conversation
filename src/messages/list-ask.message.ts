import { BaseMessage } from ".";
import { MessageTransferGenerator, BaseLogger, MessageTransfer } from "..";

interface IListAsk {
	id: string;
	text: string;
	stopCommand: string;
	maxCount: number;
}

export class ListAsk extends BaseMessage {
	protected text: string;
	protected stopCommand: string;
	protected maxCount: number;

	public constructor({ id, text, stopCommand, maxCount }: IListAsk) {
		super(id);
		this.text = text;
		this.stopCommand = stopCommand.toLowerCase();
		this.maxCount = maxCount;
	}

	protected override *baseIterator(
		logger: BaseLogger
	): MessageTransferGenerator {
		yield new MessageTransfer({
			id: this.id,
			text: this.text,
			skip: true,
		});

		logger.setArray(this.id);

		for (let count = 1; count <= this.maxCount; count++) {
			const itemId = `${this.id}.${count}`;

			const answer = yield new MessageTransfer({
				id: itemId,
			});

			if (!answer) {
				return;
			}

			logger.log(itemId, answer);

			if (answer.toLowerCase() === this.stopCommand) {
				return;
			}

			logger.addArrayItem(this.id, answer ?? "");
		}
	}
}
