import { getMailerConfig } from "src/config/factories";

import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { MailService } from "./mail.service";
import { TemplateService } from "./template.service";

@Module({
	imports: [
		MailerModule.forRootAsync({
			useFactory: getMailerConfig,
			inject: [ConfigService],
		}),
	],
	providers: [MailService, TemplateService],
	exports: [MailService],
})
export class MailModule {}
