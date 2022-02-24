import { BaseMessage } from ".";
import { BaseLogger, MessageTransfer, MessageTransferGenerator } from "..";

interface ITerminateGroup {
	id: string;
	child?: BaseMessage;
}

export class TerminateGroup extends BaseMessage {
	protected child?: BaseMessage;

	public constructor({ id, child }: ITerminateGroup) {
		super(id);
		this.child = child;
	}

	protected override *_baseIterator(
		logger: BaseLogger
	): MessageTransferGenerator {
		if (this.child) {
			yield* this.child.iterator(logger);
		}

		yield new MessageTransfer({
			id: this.id,
			skip: true,
			terminateGroup: true,
		});
	}
}
