import { BaseLogger } from ".";

export class DictLogger extends BaseLogger {
	protected readonly: boolean = false;
	protected data: Record<string, string | string[]> = {};
	protected history: string[] = [];

	public override log(id: string, value: string): void {
		if (!this.readonly) {
			this.data[id] = value;
		}
	}

	public override setArray(id: string): void {
		if (!this.readonly) {
			this.data[id] = [];
		}
	}

	public override addArrayItem(id: string, value: string): void {
		if (!this.readonly) {
			(this.data[id] as string[]).push(value);
		}
	}

	public override get(id: string): string | string[] | undefined {
		return this.data[id];
	}

	public override getResult(): Record<string, string | string[]> {
		return this.data;
	}

	public override resetHistory(): void {
		this.history = [];
	}

	public override logLastId(id: string): void {
		this.history.push(id);
	}

	public override getLastId(): string | undefined {
		if (this.history.length === 0) {
			return;
		}

		return this.history[this.history.length - 1];
	}
}
