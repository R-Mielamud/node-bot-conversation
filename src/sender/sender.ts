import {
	MessageTransferGenerator,
	BaseLogger,
	BaseMessage,
	MessageTransfer,
} from "..";

interface IMessageSender {
	headline?: string;
	stopCommand?: string;
	root: BaseMessage;
	logger: BaseLogger;
	send: (text: string) => void;
}

export class MessageSender {
	public finished: boolean = false;
	public terminated: boolean = false;
	protected headlineText?: string;
	protected stopCommand?: string;
	protected iterator: MessageTransferGenerator;
	protected logger: BaseLogger;
	protected baseSend: (text: string) => void;
	protected resentMessage?: MessageTransfer;
	protected currentMessage?: MessageTransfer;

	public constructor({
		headline,
		stopCommand,
		root,
		logger,
		send,
	}: IMessageSender) {
		this.headlineText = headline;
		this.stopCommand = stopCommand?.toLowerCase();
		this.iterator = root.iterator(logger);
		this.logger = logger;
		this.baseSend = send;

		this.sendHeadline();
		this.restore();
	}

	public sendAllSkippable(prevAnswer?: string) {
		if (prevAnswer?.toLowerCase() === this.stopCommand) {
			this.finished = true;
			this.terminated = true;
		}

		if (this.resentMessage) {
			this.send(this.resentMessage.text);
			this.resentMessage = undefined;
		}

		while (this.currentMessage.skip) {
			const { done, value } = this.iterator.next(prevAnswer);

			if (done || !value) {
				this.finished = true;
				break;
			}
		}
	}

	public finalize(): Record<string, string | string[]> {
		this.iterator.return();

		const result = this.logger.getResult();
		this.logger.finalize();

		return result;
	}

	protected send(text?: string) {
		if (text === undefined) {
			return;
		}

		this.baseSend(text);
	}

	protected sendHeadline() {
		this.send(this.headlineText);
	}

	protected restore() {
		const lastId = this.logger.getLastId();
		this.logger.resetHistory();

		if (lastId !== undefined) {
			this.logger.toggleReadonly(true);

			while (true) {
				const { done, value } = this.iterator.next();

				if (done || !value) {
					this.finished = true;
					break;
				}

				if (value.id === lastId) {
					break;
				}

				this.currentMessage = value;
			}

			this.logger.toggleReadonly(false);
		}

		this.resentMessage = this.currentMessage;
	}
}
