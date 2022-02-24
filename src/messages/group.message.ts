import { BaseMessage } from ".";
import { MessageTransferGenerator, BaseLogger, MessageTransfer } from "..";

interface IGroup {
	id: string;
	children: BaseMessage[];
}

export class Group extends BaseMessage {
	protected children: BaseMessage[];

	public constructor({ id, children }: IGroup) {
		super(id);
		this.children = children;
	}

	protected *_baseIterator(logger: BaseLogger): MessageTransferGenerator {
		for (const child of this.children) {
			let terminated: boolean = false;
			let prevAnswer: string | undefined;

			const iter = child.iterator(logger);

			while (true) {
				const { done, value } = iter.next(prevAnswer);

				if (done || !value) {
					break;
				}

				if (value.terminateGroup) {
					yield new MessageTransfer({
						id: value.id,
						text: value.text,
						skip: true,
					});

					terminated = true;
					break;
				}

				yield value;
			}

			if (terminated) {
				break;
			}
		}
	}
}
