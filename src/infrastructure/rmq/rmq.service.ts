import { Channel, Message } from "amqplib";
import { Counter } from "prom-client";
import { SERVICE_NAME } from "src/constants";

import { Injectable, Logger } from "@nestjs/common";
import { RmqContext } from "@nestjs/microservices";
import { InjectMetric } from "@willsoto/nestjs-prometheus";

@Injectable()
export class RmqService {
	private readonly logger = new Logger(RmqService.name);

	constructor(
		@InjectMetric("rmq_events_ack_total")
		private readonly ackTotal: Counter<string>,

		@InjectMetric("rmq_events_nack_total")
		private readonly nackTotal: Counter<string>,
	) {}

	ack(context: RmqContext, event: string) {
		const channel = context.getChannelRef() as Channel;
		const msg = context.getMessage() as Message;
		const tag = msg.fields.deliveryTag;

		if (!tag) return;

		channel.ack(msg);

		this.ackTotal.inc({
			service: SERVICE_NAME,
			event,
		});

		this.logger.debug(`ACK (pattern: ${context.getPattern()}, tag: ${tag})`);
	}

	nack(context: RmqContext, event: string, requeue = false) {
		const channel = context.getChannelRef() as Channel;
		const msg = context.getMessage() as Message;
		const tag = msg.fields.deliveryTag;

		if (!tag) return;

		channel.nack(msg, false, requeue);

		this.nackTotal.inc({
			service: SERVICE_NAME,
			event,
		});

		if (requeue) {
			this.logger.warn(
				`NACK response (pattern: ${context.getPattern()}, tag: ${tag})`,
			);
		} else {
			this.logger.error(
				`NACK drop (pattern: ${context.getPattern()}, tag: ${tag})`,
			);
		}
	}
}
