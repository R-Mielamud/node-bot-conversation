import { BaseMessage } from ".";
import { MessageTransferGenerator, BaseLogger } from "..";

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
			yield* child.iterator(logger);
		}
	}
}
