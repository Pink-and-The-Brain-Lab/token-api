import RabbitMqManageConnection from "../utils/RabbitMqManageConnection";
import { RabbitMqQueues } from "../utils/rabbitmq-queues.enum";
import CreateValidationTokenService from "./CreateValidationTokenService";
import ValidationTokenService from "./ValidationTokenService";

class RabbitMqListener {
    private rabbitmq: any;

    async listeners() {
        this.rabbitmq = new RabbitMqManageConnection();
        this.createTokenListener();
        this.validateTokenListener();
    }

    private async createTokenListener() {
        const channel = await this.rabbitmq.createChannel(RabbitMqQueues.CREATE_TOKEN);
        channel.consume(RabbitMqQueues.CREATE_TOKEN, async (message: any) => {
            if (!message) return;
            const content = JSON.parse(message.content.toString());
            let response: any = await this.createToken(content.data);
            if (!response.statusCode) response = { created: true };
            this.rabbitQueueResponse(channel, message, response);
            channel.ack(message);
        });
    }

    private async createToken(email: string) {
        try {
            const service = new CreateValidationTokenService();
            return await service.execute(email);
        } catch (error) {
            return error;
        }
    }

    private rabbitQueueResponse(channel: any, message: any, response: any) {
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
        channel.consume(RabbitMqQueues.VALIDATE_TOKEN, async (message: any) => {
            if (!message) return;
            const content = JSON.parse(message.content.toString());
            let response: any = await this.validateToken(content.data);
            this.rabbitQueueResponse(channel, message, response);
            channel.ack(message);
        });
    }

    private async validateToken(token: string) {
        try {
            const service = new ValidationTokenService();
            return await service.execute({token});
        } catch (error) {
            return error;
        }
    }
  
};

export default RabbitMqListener;
