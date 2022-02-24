import { BaseMessage } from ".";
import { MessageTransfer, MessageTransferGenerator } from "..";

interface ITextMessage {
	id: string;
	text: string;
}

export class TextMessage extends BaseMessage {
	protected text: string;

	public constructor({ id, text }: ITextMessage) {
		super(id);
		this.text = text;
	}

	protected override *_baseIterator(): MessageTransferGenerator {
		yield new MessageTransfer({
			id: this.id,
			text: this.text,
			skip: true,
		});
	}
}
