import { SmsOptions } from "src/infrastructure/sms/interfaces";

import { ConfigService } from "@nestjs/config";

export function getExolveConfig(configService: ConfigService): SmsOptions {
	return {
		apiKey: configService.getOrThrow<string>("exolve.apiKey"),
		sender: configService.getOrThrow("exolve.sender"),
	};
}
