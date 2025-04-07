import CreateValidationTokenService from './CreateValidationTokenService';
import { AppError, ValidateEmail } from 'millez-lib-api';
import { AppDataSource } from '../data-source';
import ValidationToken from '../models/validation-token.model';

jest.mock('../data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('millez-lib-api', () => ({
    AppError: jest.fn(),
    ValidateEmail: jest.fn().mockImplementation(() => ({
        validate: jest.fn(),
    })),
}));

describe('CreateValidationTokenService', () => {
    let createValidationTokenService: CreateValidationTokenService;

    beforeEach(() => {
        createValidationTokenService = new CreateValidationTokenService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create and return a validation token when email is valid', async () => {
        const mockEmail = 'test@example.com';
        const mockValidate = jest.fn().mockReturnValue(true);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const mockTokenData = {
            token: '123456',
            email: mockEmail,
            validateTokenTime: new Date(),
            createdAt: new Date(),
            validated: false,
        };
        const mockRepository = {
            create: jest.fn().mockReturnValue(mockTokenData),
            save: jest.fn().mockResolvedValue(mockTokenData),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        const result = await createValidationTokenService.execute(mockEmail);
        expect(mockValidate).toHaveBeenCalledWith(mockEmail);
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(ValidationToken);
        expect(mockRepository.create).toHaveBeenCalled();
        expect(mockRepository.save).toHaveBeenCalledWith(mockTokenData);
        expect(result).toEqual(mockTokenData);
    });

    it('should throw an error if the email is invalid', async () => {
        const mockEmail = 'invalid-email';
        const mockValidate = jest.fn().mockReturnValue(false);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        await expect(createValidationTokenService.execute(mockEmail)).rejects.toEqual({});
        expect(AppError).toHaveBeenCalledWith('API_ERRORS.INVALID_EMAIL');
        expect(mockValidate).toHaveBeenCalledWith(mockEmail);
        expect(AppDataSource.getRepository).not.toHaveBeenCalled();
    });

    it('should generate a token of the correct size', async () => {
        const mockEmail = 'test@example.com';
        const mockValidate = jest.fn().mockReturnValue(true);
        (ValidateEmail as jest.Mock).mockImplementation(() => ({
            validate: mockValidate,
        }));
        const mockRepository = {
            create: jest.fn().mockReturnValue({
                token: '123456',
                email: mockEmail,
            }),
            save: jest.fn(),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        const result = await createValidationTokenService.execute(mockEmail);
        expect(AppDataSource.getRepository).toHaveBeenCalled();
        expect(result.token).toHaveLength(6);
        expect(/^\d{6}$/.test(result.token)).toBe(true);
    });
});
