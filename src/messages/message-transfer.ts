interface IMessageTransfer {
	id: string;
	text?: string;
	skip?: boolean;
	terminateGroup?: boolean;
}

export class MessageTransfer {
	public id: string;
	public text?: string;
	public skip?: boolean;
	public terminateGroup?: boolean;

	public constructor({ id, text, skip, terminateGroup }: IMessageTransfer) {
		this.id = id;
		this.text = text;
		this.skip = skip;
		this.terminateGroup = terminateGroup;
	}
}
