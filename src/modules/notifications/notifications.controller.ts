import { RmqService } from "src/infrastructure/rmq/rmq.service";

import type {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent,
} from "@mondocinema/contracts";
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsController {
	private readonly logger = new Logger(NotificationsController.name);

	constructor(
		private readonly rmqService: RmqService,
		private readonly notificationsService: NotificationsService,
	) {}

	@EventPattern("auth.otp.requested")
	async otpRequested(
		@Payload() data: OtpRequestedEvent,
		@Ctx() ctx: RmqContext,
	) {
		try {
			await this.notificationsService.sendOtp(data);

			this.rmqService.ack(ctx);
		} catch (error: any) {
			this.logger.error("OTP processing error: ", error.message ?? error);

			this.rmqService.nack(ctx);
		}
	}

	@EventPattern("account.phone.changed")
	async phoneChanged(
		@Payload() data: PhoneChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		try {
			await this.notificationsService.sendPhoneChange(data);

			this.rmqService.ack(ctx);
		} catch (error: any) {
			this.logger.error("Phone change error: ", error.message ?? error);

			this.rmqService.nack(ctx);
		}
	}

	@EventPattern("account.email.changed")
	async emailChanged(
		@Payload() data: EmailChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		try {
			await this.notificationsService.sendEmailChange(data);

			this.rmqService.ack(ctx);
		} catch (error: any) {
			this.logger.error("Email change error: ", error.message ?? error);

			this.rmqService.nack(ctx);
		}
	}
}
