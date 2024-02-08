import { RabbitMqQueues } from "../enums/rabbitmq-queues.enum";
import CreateValidationTokenService from "./CreateValidationTokenService";
import ValidationTokenService from "./ValidationTokenService";
import { IValidationTokenData } from "./interfaces/validation-token-data.interface";
import { RabbitMqListener, RabbitMqManageConnection } from "millez-lib-api";

class RabbitListener {
    private rabbitmq: RabbitMqManageConnection;

    async listeners() {
        const connection = new RabbitMqManageConnection('amqp://localhost');
        const rabbitListener = new RabbitMqListener(connection);
        rabbitListener.genericListener<IValidationTokenData, string>(RabbitMqQueues.CREATE_TOKEN, this.createToken);
        rabbitListener.genericListener<IValidationTokenData, string>(RabbitMqQueues.VALIDATE_TOKEN, this.validateToken);
    }

    private async createToken(email: string): Promise<IValidationTokenData> {
        try {
            const service = new CreateValidationTokenService();
            return await service.execute(email);
        } catch (error) {
            return error as IValidationTokenData;
        }
    }

    private async validateToken(token: string): Promise<IValidationTokenData> {
        try {
            const service = new ValidationTokenService();
            return await service.execute({token});
        } catch (error) {
            return error as IValidationTokenData;
        }
    }
  
};

export default RabbitListener;
