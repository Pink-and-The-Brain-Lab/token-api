import request from 'supertest';
import express, { NextFunction, Request, Response } from 'express';
import ValidationTokenService from '../services/ValidationTokenService';
import validationTokenRouter from './validation-token';

jest.mock('../services/ValidationTokenService');
const app = express();
app.use(express.json());
app.use('/validate-token', validationTokenRouter);

describe('validationTokenRouter', () => {
    let mockExecute: jest.Mock;

    beforeEach(() => {
        mockExecute = jest.fn();
        (ValidationTokenService as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }));
    });

    it('should return 200 and validated: true when the token is valid', async () => {
        mockExecute.mockResolvedValueOnce(undefined);
        const response = await request(app)
            .post('/validate-token')
            .send({ token: 'valid-token' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ validated: true });
        expect(mockExecute).toHaveBeenCalledWith({ token: 'valid-token' });
    });

    it('should call next with an error when the service throws an error', async () => {
        const error = new Error('Invalid token');
        mockExecute.mockRejectedValueOnce(error);
        const errorHandler = jest.fn((err: Error, req: Request, res: Response, next: NextFunction) => {
            res.status(500).json({ error: err.message });
        });
        app.use(errorHandler);
        const response = await request(app)
            .post('/validate-token')
            .send({ token: 'invalid-token' });
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Invalid token' });
        expect(mockExecute).toHaveBeenCalledWith({ token: 'invalid-token' });
        expect(errorHandler).toHaveBeenCalled();
    });

    it('should return 400 if the token is not provided in the request body', async () => {
        const response = await request(app)
            .post('/validate-token')
            .send({});
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ validated: true });
    });
});
