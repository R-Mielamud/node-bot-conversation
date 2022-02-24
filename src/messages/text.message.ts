import { BaseMessage } from ".";
import { MessageTransfer, MessageTransferGenerator } from "..";

interface IText {
	id: string;
	text: string;
}

export class Text extends BaseMessage {
	protected text: string;

	public constructor({ id, text }: IText) {
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
