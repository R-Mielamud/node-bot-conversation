import { BaseMessage } from ".";
import { MessageTransferGenerator, MessageTransfer, BaseLogger } from "..";

interface IAsk {
	id: string;
	text: string;
}

export class Ask extends BaseMessage {
	protected text: string;

	public constructor({ id, text }: IAsk) {
		super(id);
		this.text = text;
	}

	protected *baseIterator(logger: BaseLogger): MessageTransferGenerator {
		const answer = yield new MessageTransfer({
			id: this.id,
			text: this.text,
		});

		logger.log(this.id, answer);
	}
}
