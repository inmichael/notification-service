import z from "zod";

export enum Environment {
	Development = "development",
	Test = "test",
	Production = "production",
}

const amqpUrl = z
	.string()
	.nonempty()
	.refine(
		(value) => {
			try {
				const url = new URL(value);

				return url.protocol === "amqp:" || url.protocol === "amqps:";
			} catch {
				return false;
			}
		},
		{
			message: "RMQ_URL must be a valid amqp:// or amqps:// URL",
		},
	);

export default z.object({
	NODE_ENV: z.enum(Environment).default(Environment.Development),

	RMQ_URL: amqpUrl,
	RMQ_QUEUE: z.string().nonempty(),

	SMTP_HOST: z.string().nonempty(),
	SMTP_PORT: z.coerce.number().int().min(1).max(65535),
	SMTP_USERNAME: z.string().nonempty(),
	SMTP_PASSWORD: z.string().nonempty(),
	SMTP_FROM_ADDRESS: z.email().nonempty(),
	SMTP_SECURE: z.enum(["true", "false"]).transform((v) => v === "true"),

	EXOLVE_API_KEY: z.string().nonempty(),
	EXOLVE_SENDER: z.string().nonempty(),
});
