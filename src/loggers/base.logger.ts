export abstract class BaseLogger {
	public abstract log(id: string, value: string): void;
	public abstract setArray(id: string): void;
	public abstract addArrayItem(id: string, value: string): void;
	public abstract get(id: string): string | string[] | undefined;
	public abstract getResult(): Record<string, string | string[]>;
	public resetHistory(): void {}
	public logLastId(id: string): void {}

	public getLastId(): string | undefined {
		return undefined;
	}

	public toggleReadonly(isReadonly: boolean): void {}
	public finalize(): void {}
}
