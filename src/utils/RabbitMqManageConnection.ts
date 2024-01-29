import amqplib, { Channel, Connection } from 'amqplib';
import { RabbitMqQueues } from './rabbitmq-queues.enum';

class RabbitMqManageConnection {
    private CONNECTION: Connection;

    async createChannel(queueName: RabbitMqQueues): Promise<Channel> {
        this.CONNECTION = await amqplib.connect('amqp://localhost');
        const channel: Channel = await this.CONNECTION.createChannel();
        await channel.assertQueue(queueName);
        return channel;
    }
}

export default RabbitMqManageConnection;
