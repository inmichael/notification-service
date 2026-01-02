import { MailService } from "src/infrastructure/mail/mail.service";
import { SmsService } from "src/infrastructure/sms/sms.service";

import type {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent,
} from "@mondocinema/contracts";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationsService {
	constructor(
		private readonly mailService: MailService,
		private readonly smsService: SmsService,
	) {}

	async sendOtp({ identifier, code, type }: OtpRequestedEvent) {
		if (type === "email") {
			await this.mailService.sendOtp(identifier, code);
		} else {
			await this.smsService.sendOtp(identifier, code);
		}
	}

	async sendPhoneChange({ code, phone }: PhoneChangedEvent) {
		return await this.smsService.sendPhoneChange(phone, code);
	}

	async sendEmailChange({ code, email }: EmailChangedEvent) {
		return await this.mailService.sendEmailChange(email, code);
	}
}
