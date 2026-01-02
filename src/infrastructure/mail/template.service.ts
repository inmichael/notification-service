import Handlebars from "handlebars";
import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateService {
	private cache = new Map<string, Handlebars.TemplateDelegate>();

	async render(templateName: string, context?: Record<string, any>) {
		if (!this.cache.has(templateName)) {
			const templatePath = path.join(
				process.cwd(),
				"src/infrastructure/mail/templates",
				`${templateName}.hbs`,
			);

			const file = fs.readFileSync(templatePath, "utf-8");

			this.cache.set(templateName, Handlebars.compile(file));
		}

		const template = this.cache.get(templateName);

		return template!(context);
	}
}
