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
		if (
			this.stopCommand &&
			prevAnswer?.toLowerCase() === this.stopCommand
		) {
			this.finished = true;
			this.terminated = true;
		}

		if (this.resentMessage) {
			this.send(this.resentMessage.text);
			const skip = this.resentMessage.skip;
			this.resentMessage = undefined;

			if (!skip) {
				return;
			}
		}

		while (true) {
			const { done, value } = this.iterator.next(prevAnswer);

			if (done || !value) {
				this.finished = true;
				break;
			}

			this.send(value.text);

			if (!value.skip) {
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
		let answer: string | string[] | undefined;
		this.logger.resetHistory();

		if (lastId !== undefined) {
			while (true) {
				const { done, value } = this.iterator.next(
					answer as string | undefined
				);

				if (done || !value) {
					this.finished = true;
					break;
				}

				this.resentMessage = value;

				if (value.id === lastId) {
					break;
				}

				answer = this.logger.get(value.id);
			}
		}
	}
}
