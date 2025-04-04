import request from 'supertest';
import express from 'express';
import CreateValidationTokenService from '../services/CreateValidationTokenService';
import { AppError, ValidateEmail } from 'millez-lib-api';
import generateNewTokenRouter from './generate-new-token';

jest.mock('../services/CreateValidationTokenService');
jest.mock('millez-lib-api', () => ({
    AppError: jest.fn(),
    ValidateEmail: jest.fn().mockImplementation(() => ({
        validate: jest.fn(),
    })),
}));

const app = express();
app.use(express.json());
app.use('/generate-token', generateNewTokenRouter);

describe('generateNewTokenRouter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and created: true when email is valid and token is created', async () => {
        const mockValidate = jest.fn().mockReturnValue(true);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const mockExecute = jest.fn().mockResolvedValue(undefined);
        (CreateValidationTokenService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
        const response = await request(app)
            .post('/generate-token')
            .send({ email: 'test@example.com' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ created: true });
        expect(mockValidate).toHaveBeenCalledWith('test@example.com');
        expect(mockExecute).toHaveBeenCalledWith('test@example.com');
    });

    it('should return 400 when email is invalid', async () => {
        const mockValidate = jest.fn().mockReturnValue(false);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const response = await request(app)
            .post('/generate-token')
            .send({ email: 'invalid-email' });
        expect(response.status).toBe(500);
        expect(mockValidate).toHaveBeenCalledWith('invalid-email');
        expect(AppError).toHaveBeenCalledWith('API_ERRORS.INVALID_EMAIL');
    });

    it('should call next with an error if CreateValidationTokenService throws an error', async () => {
        const mockValidate = jest.fn().mockReturnValue(true);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const mockError = new Error('Service error');
        const mockExecute = jest.fn().mockRejectedValue(mockError);
        (CreateValidationTokenService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
        const response = await request(app)
            .post('/generate-token')
            .send({ email: 'test@example.com' });
        expect(response.status).toBe(500);
        expect(mockValidate).toHaveBeenCalledWith('test@example.com');
        expect(mockExecute).toHaveBeenCalledWith('test@example.com');
    });
});
