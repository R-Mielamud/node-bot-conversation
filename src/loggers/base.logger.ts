export abstract class BaseLogger {
	public abstract log(id: string, value: string): void;
	public abstract setArray(id: string): void;
	public abstract addArrayItem(id: string, value: string): void;
	public abstract get(id: string, value: string): string;
	public abstract getResult(): Record<string, string | string[]>;
	public abstract resetHistory(): void;
	public abstract logLastId(id: string): void;
	public abstract getLastId(): string;
	public finalize(): void {}
}
