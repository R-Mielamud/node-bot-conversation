import fs from "fs";
import { BaseLogger } from ".";

export class JsonFileLogger extends BaseLogger {
	protected path: string;
	protected cache: Record<string, any> = {};

	public constructor(filePath: string) {
		super();
		this.path = filePath;
		this.initFile();
	}

	public override log(id: string, value: string): void {
		this.cache.data[id] = value;
		this.write();
	}

	public override setArray(id: string): void {
		this.cache.data[id] = [];
		this.write();
	}

	public override addArrayItem(id: string, value: string): void {
		this.cache.data[id].push(value);
		this.write();
	}

	public override get(id: string): string | string[] {
		return this.cache.data[id];
	}

	public override getResult(): Record<string, string | string[]> {
		return this.cache.data;
	}

	public override resetHistory(): void {
		this.cache.history = [];
		this.write();
	}

	public override logLastId(id: string): void {
		this.cache.history.push(id);
		this.write();
	}

	public override getLastId(): string | undefined {
		const len = this.cache.history.length;

		if (!len) {
			return;
		}

		return this.cache.history[len - 1];
	}

	public override finalize(): void {
		fs.unlinkSync(this.path);
	}

	protected initFile(): void {
		if (fs.existsSync(this.path)) {
			const content = fs.readFileSync(this.path);
			this.cache = JSON.parse(content.toString());

			return;
		}

		this.cache = {
			data: {},
			history: [],
		};

		this.write();
	}

	protected write(): void {
		fs.writeFileSync(this.path, JSON.stringify(this.cache));
	}
}
