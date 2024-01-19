import RabbitMqManageConnection from "../utils/rabbitmq-manage-conections";
import { RabbitMqQueues } from "../utils/rabbitmq-queues.enum";
import CreateValidationTokenService from "./CreateValidationTokenService";

class RabbitMqListener {
    private rabbitmq: any;

    async listeners() {
        this.rabbitmq = new RabbitMqManageConnection();
        this.createListener();
    }

    private async createListener() {
        try {
            const channel = await this.rabbitmq.createChannel(RabbitMqQueues.CREATE_TOKEN);
            channel.consume(RabbitMqQueues.CREATE_TOKEN, (message: any) => {
                if (!message) return;
                this.createToken(message.content.toString());
                channel.ack(message);
            });
          } catch (error) {
            console.error(error);
          }
    }

    private async createToken(email: string) {
        const service = new CreateValidationTokenService();
        await service.execute(email);
    }

    private async validateListener() {
        // create a listener to validate token and after the validatio create a caller 
        // to send to users API thast the token was been validated
    }
  
};

export default RabbitMqListener;
