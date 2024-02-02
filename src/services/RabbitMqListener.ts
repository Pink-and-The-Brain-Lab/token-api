import { Channel, ConsumeMessage } from "amqplib";
import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import CreateValidationTokenService from "./CreateValidationTokenService";
import ValidationTokenService from "./ValidationTokenService";
import { IErrorMessage } from "../errors/error-message.interface";
import { IRabbitQueueContent } from "./interfaces/rabbit-queue-content.inteface";
import { responseRabbitQueue } from "./interfaces/response-rabbit-queue.type";
import { IValidationTokenData } from "./interfaces/validation-token-data.interface";
import RabbitMqManageConnection from "millez-lib-api/src/rabbitMQ-manage-connection/RabbitMqManageConnection";

class RabbitMqListener {
    private rabbitmq: RabbitMqManageConnection;

    async listeners() {
        this.rabbitmq = new RabbitMqManageConnection('amqp://localhost');
        this.createTokenListener();
        this.validateTokenListener();
    }

    private async createTokenListener() {
        const channel = await this.rabbitmq.createChannel(RabbitMqQueues.CREATE_TOKEN);
        channel.consume(RabbitMqQueues.CREATE_TOKEN, async (message: ConsumeMessage | null) => {
            if (!message) return;
            const content: IRabbitQueueContent = JSON.parse(message.content.toString());
            let response: IValidationTokenData | IErrorMessage = await this.createToken(content.data);
            this.rabbitQueueResponse(channel, message, response);
            channel.ack(message);
        });
    }

    private async createToken(email: string): Promise<IValidationTokenData | IErrorMessage> {
        try {
            const service = new CreateValidationTokenService();
            return await service.execute(email);
        } catch (error) {
            return error as IErrorMessage;
        }
    }

    private rabbitQueueResponse(channel: Channel, message: ConsumeMessage, response: responseRabbitQueue) {
        const correlationId = message.properties.correlationId;
        const replyTo = message.properties.replyTo;
        channel.sendToQueue(
            replyTo,
            Buffer.from(JSON.stringify(response)),
            { correlationId }
        );
    }

    private async validateTokenListener() {
        const channel = await this.rabbitmq.createChannel(RabbitMqQueues.VALIDATE_TOKEN);
        channel.consume(RabbitMqQueues.VALIDATE_TOKEN, async (message: ConsumeMessage | null) => {
            if (!message) return;
            const content: IRabbitQueueContent = JSON.parse(message.content.toString());
            let response: IValidationTokenData | IErrorMessage = await this.validateToken(content.data);
            this.rabbitQueueResponse(channel, message, response);
            channel.ack(message);
        });
    }

    private async validateToken(token: string): Promise<IValidationTokenData | IErrorMessage> {
        try {
            const service = new ValidationTokenService();
            return await service.execute({token});
        } catch (error) {
            return error as IErrorMessage;
        }
    }
  
};

export default RabbitMqListener;
