import { BaseLogger } from ".";

export class DictLogger extends BaseLogger {
	protected data: Record<string, string | string[]> = {};
	protected history: string[] = [];

	public log(id: string, value: string): void {
		this.data[id] = value;
	}

	public setArray(id: string): void {
		this.data[id] = [];
	}

	public addArrayItem(id: string, value: string): void {
		(this.data[id] as string[]).push(value);
	}

	public get(id: string): string | string[] | void {
		return this.data[id];
	}

	public getResult(): Record<string, string | string[]> {
		return this.data;
	}

	public resetHistory(): void {
		this.history = [];
	}

	public logLastId(id: string): void {
		this.history.push(id);
	}

	public getLastId(): string | void {
		if (this.history.length === 0) {
			return;
		}

		return this.history[this.history.length - 1];
	}
}
