import { Counter, Histogram } from "prom-client";
import { EVENT_NAMES, SERVICE_NAME } from "src/constants";
import { RmqService } from "src/infrastructure/rmq/rmq.service";

import type {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent,
} from "@mondocinema/contracts";
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { InjectMetric } from "@willsoto/nestjs-prometheus";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsController {
	private readonly logger = new Logger(NotificationsController.name);

	constructor(
		private readonly rmqService: RmqService,
		private readonly notificationsService: NotificationsService,

		@InjectMetric("rmq_event_processing_duration_seconds")
		private readonly processingDuration: Histogram<string>,

		@InjectMetric("rmq_events_total")
		private readonly eventsTotal: Counter<string>,
	) {}

	@EventPattern(EVENT_NAMES.AUTH.OTP_REQUESTED)
	async otpRequested(
		@Payload() data: OtpRequestedEvent,
		@Ctx() ctx: RmqContext,
	) {
		const event = EVENT_NAMES.AUTH.OTP_REQUESTED;

		const endTimer = this.processingDuration.startTimer({
			service: SERVICE_NAME,
			event,
		});

		try {
			await this.notificationsService.sendOtp(data);

			this.eventsTotal.inc({
				service: SERVICE_NAME,
				event,
				status: "success",
			});

			this.rmqService.ack(ctx, event);
		} catch (error: any) {
			this.eventsTotal.inc({
				service: SERVICE_NAME,
				event,
				status: "error",
			});

			this.logger.error("OTP processing error: ", error.message ?? error);

			this.rmqService.nack(ctx, event);

			throw error;
		} finally {
			endTimer();
		}
	}

	@EventPattern(EVENT_NAMES.ACCOUNT.PHONE_CHANGED)
	async phoneChanged(
		@Payload() data: PhoneChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		const event = EVENT_NAMES.ACCOUNT.PHONE_CHANGED;

		const endTimer = this.processingDuration.startTimer({
			service: SERVICE_NAME,
			event,
		});

		try {
			await this.notificationsService.sendPhoneChange(data);

			this.eventsTotal.inc({
				service: SERVICE_NAME,
				event,
				status: "success",
			});

			this.rmqService.ack(ctx, event);
		} catch (error: any) {
			this.eventsTotal.inc({
				service: SERVICE_NAME,
				event,
				status: "error",
			});

			this.logger.error("Phone change error: ", error.message ?? error);

			this.rmqService.nack(ctx, event);
		} finally {
			endTimer();
		}
	}

	@EventPattern(EVENT_NAMES.ACCOUNT.EMAIL_CHANGED)
	async emailChanged(
		@Payload() data: EmailChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		const event = EVENT_NAMES.ACCOUNT.EMAIL_CHANGED;

		const endTimer = this.processingDuration.startTimer({
			service: SERVICE_NAME,
			event,
		});

		try {
			await this.notificationsService.sendEmailChange(data);

			this.eventsTotal.inc({
				service: SERVICE_NAME,
				event,
				status: "success",
			});

			this.rmqService.ack(ctx, event);
		} catch (error: any) {
			this.eventsTotal.inc({
				service: SERVICE_NAME,
				event,
				status: "error",
			});

			this.logger.error("Email change error: ", error.message ?? error);

			this.rmqService.nack(ctx, event);
		} finally {
			endTimer();
		}
	}
}
