import { BaseLogger } from ".";

export class DictLogger extends BaseLogger {
	protected readonly: boolean;
	protected data: Record<string, string | string[]> = {};
	protected history: string[] = [];

	public log(id: string, value: string): void {
		if (!this.readonly) {
			this.data[id] = value;
		}
	}

	public setArray(id: string): void {
		if (!this.readonly) {
			this.data[id] = [];
		}
	}

	public addArrayItem(id: string, value: string): void {
		if (!this.readonly) {
			(this.data[id] as string[]).push(value);
		}
	}

	public get(id: string): string | string[] | undefined {
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

	public toggleReadonly(isReadonly: boolean): void {
		this.readonly = isReadonly;
	}

	public getLastId(): string | undefined {
		if (this.history.length === 0) {
			return;
		}

		return this.history[this.history.length - 1];
	}
}
