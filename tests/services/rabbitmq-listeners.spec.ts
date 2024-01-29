import RabbitMqListener from "../../src/services/RabbitMqListener";
import amqplib from 'amqplib';

const mockConnection: any = {
    close: () => jest.fn(),
    createChannel: () => ({
        assertQueue: () => jest.fn(),
        consume: () => jest.fn(),
    }),
    createConfirmChannel: () => jest.fn(),
};

describe('RabbitMqListener', () => {
    let rabbitmq: RabbitMqListener;

    beforeEach(() => {
        rabbitmq = new RabbitMqListener();
        jest.spyOn(amqplib, 'connect').mockReturnValue(mockConnection);
    });

    it('should call listeners', () => {
        const spyCreateTokenListener = jest.spyOn(rabbitmq, 'createTokenListener' as any);
        const spyValidateTokenListener = jest.spyOn(rabbitmq, 'validateTokenListener' as any);
        rabbitmq.listeners();
        expect(spyCreateTokenListener).toHaveBeenCalled();
        expect(spyValidateTokenListener).toHaveBeenCalled();
    });

    it('should respond to originate queue', async () => {
        const mockChannel: any = { sendToQueue: () => jest.fn() };
        const mockMessage: any = {
            properties: {
                correlationId: '12345',
                replyTo: 'queue',
            },
        };
        const mockResponse: any = 'response';
        const spy = jest.spyOn(mockChannel, 'sendToQueue');
        rabbitmq['rabbitQueueResponse'](mockChannel, mockMessage, mockResponse);
        expect(spy).toHaveBeenCalled();
    });
});
