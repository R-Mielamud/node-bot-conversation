import { BaseMessage } from ".";
import { MessageTransferGenerator, MessageTransfer, BaseLogger } from "..";

interface ISwitch {
	id: string;
	text: string;
	answerMap: Record<string, BaseMessage>;
	fallback?: BaseMessage;
	repeatOnFallback?: boolean;
}

export class Switch extends BaseMessage {
	protected text: string;
	protected answerMap: Record<string, BaseMessage>;
	protected fallback?: BaseMessage;
	protected repeatOnFallback: boolean;

	public constructor({
		id,
		text,
		answerMap,
		fallback,
		repeatOnFallback = false,
	}: ISwitch) {
		super(id);
		this.text = text;
		this.answerMap = answerMap;
		this.fallback = fallback;
		this.repeatOnFallback = repeatOnFallback;
	}

	protected *baseIterator(logger: BaseLogger): MessageTransferGenerator {
		const answer = yield new MessageTransfer({
			id: this.id,
			text: this.text,
		});

		const fromMap = this.answerMap[answer];
		logger.log(this.id, answer);

		if (fromMap) {
			yield* fromMap.iterator(logger);
		} else {
			if (this.fallback) {
				yield* this.fallback.iterator(logger);
			}

			if (this.repeatOnFallback) {
				yield* this.iterator(logger);
			}
		}
	}
}
