import RabbitListener from './RabbitListener';
import { RabbitMqManageConnection, RabbitMqListener } from 'millez-lib-api';
import CreateValidationTokenService from './CreateValidationTokenService';
import ValidationTokenService from './ValidationTokenService';
import { RABBITMQ_HOST_URL } from '../constants/rabbitmq-host-url';

jest.mock('millez-lib-api', () => ({
  RabbitMqManageConnection: jest.fn(),
  RabbitMqListener: jest.fn().mockImplementation(() => ({
    genericListener: jest.fn(),
  })),
}));

jest.mock('./CreateValidationTokenService');
jest.mock('./ValidationTokenService');

describe('RabbitListener', () => {
  let rabbitListener: RabbitListener;

  beforeEach(() => {
    rabbitListener = new RabbitListener();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set up listeners for CREATE_TOKEN and VALIDATE_TOKEN queues', async () => {
    const mockConnection = new RabbitMqManageConnection(RABBITMQ_HOST_URL);
    await rabbitListener.listeners();
    expect(RabbitMqManageConnection).toHaveBeenCalledWith(RABBITMQ_HOST_URL);
    expect(RabbitMqListener).toHaveBeenCalledWith(mockConnection);
  });

  it('should call CreateValidationTokenService and return the result', async () => {
    const mockExecute = jest.fn().mockResolvedValue({ token: 'mockToken' });
    (CreateValidationTokenService as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
    const email = 'test@example.com';
    const result = await (rabbitListener as any).createToken(email);
    expect(CreateValidationTokenService).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalledWith(email);
    expect(result).toEqual({ token: 'mockToken' });
  });

  it('should return the error if CreateValidationTokenService throws an error', async () => {
    const mockError = new Error('Service error');
    const mockExecute = jest.fn().mockRejectedValue(mockError);
    (CreateValidationTokenService as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
    const email = 'test@example.com';
    const result = await (rabbitListener as any).createToken(email);
    expect(CreateValidationTokenService).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalledWith(email);
    expect(result).toEqual(mockError);
  });

  it('should call ValidationTokenService and return the result', async () => {
    const mockExecute = jest.fn().mockResolvedValue({ isValid: true });
    (ValidationTokenService as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
    const token = 'mockToken';
    const result = await (rabbitListener as any).validateToken(token);
    expect(ValidationTokenService).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalledWith({ token });
    expect(result).toEqual({ isValid: true });
  });

  it('should return the error if ValidationTokenService throws an error', async () => {
    const mockError = new Error('Service error');
    const mockExecute = jest.fn().mockRejectedValue(mockError);
    (ValidationTokenService as jest.Mock).mockImplementation(() => ({
      execute: mockExecute,
    }));
    const token = 'mockToken';
    const result = await (rabbitListener as any).validateToken(token);
    expect(ValidationTokenService).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalledWith({ token });
    expect(result).toEqual(mockError);
  });
});
