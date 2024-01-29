import RabbitMqManageConnection from "../../src/utils/RabbitMqManageConnection";
import { RabbitMqQueues } from "../../src/utils/rabbitmq-queues.enum";
import amqplib from 'amqplib';

const mockConnection: any = {
    close: () => jest.fn(),
    createChannel: () => ({
        assertQueue: () => jest.fn(),
        checkQueue: () => ({
            queue: RabbitMqQueues.CREATE_TOKEN
        }),
    }),
    createConfirmChannel: () => jest.fn(),
};

describe('RabbitMqManageConnection', () => {
    let connection: RabbitMqManageConnection;

    beforeEach(() => {
        connection = new RabbitMqManageConnection();
    });

    it('should create new channel', async () => {
        const spy = jest.spyOn(amqplib, 'connect').mockReturnValue(mockConnection);
        const channel = await connection.createChannel(RabbitMqQueues.CREATE_TOKEN);
        const channelQueue = await channel.checkQueue(RabbitMqQueues.CREATE_TOKEN);
        expect(spy).toHaveBeenCalledWith('amqp://localhost');
        expect(channelQueue.queue).toEqual(RabbitMqQueues.CREATE_TOKEN);    
    });
});
