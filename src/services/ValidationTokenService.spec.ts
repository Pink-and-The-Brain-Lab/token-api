import ValidationTokenService from './ValidationTokenService';
import { AppDataSource } from '../data-source';
import ValidationToken from '../models/validation-token.model';

jest.mock('../data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock("millez-lib-api", () => ({
    AppError: jest.fn().mockImplementation((message, status) => ({ message, status })),
}));

describe('ValidationTokenService', () => {
    let validationTokenService: ValidationTokenService;

    beforeEach(() => {
        validationTokenService = new ValidationTokenService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return the registered token if it is valid', async () => {
        const mockToken = 'validToken';
        const mockValidationToken = {
            token: mockToken,
            validateTokenTime: new Date(Date.now() + 10000), // Token is valid
            validated: false,
        };
        const mockRepository = {
            findOneBy: jest.fn().mockResolvedValue(mockValidationToken),
            save: jest.fn(),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        const result = await validationTokenService.execute({ token: mockToken });
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(ValidationToken);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ token: mockToken });
        expect(mockRepository.save).toHaveBeenCalledWith({
            ...mockValidationToken,
            validated: true,
        });
        expect(result).toEqual({
            ...mockValidationToken,
            validated: true,
        });
    });

    it('should throw an error if the token is not found', async () => {
        const mockToken = 'invalidToken';
        const mockRepository = {
            findOneBy: jest.fn().mockResolvedValue(null),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        await expect(validationTokenService.execute({ token: mockToken })).rejects.toEqual({
            message: "API_ERRORS.TOKEN_NOT_FOUND",
            status: 404,
        });
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(ValidationToken);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ token: mockToken });
    });

    it('should throw an error if the token is expired', async () => {
        const mockToken = 'expiredToken';
        const mockValidationToken = {
            token: mockToken,
            validateTokenTime: new Date(Date.now() - 10000),
            validated: false,
        };
        const mockRepository = {
            findOneBy: jest.fn().mockResolvedValue(mockValidationToken),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        await expect(validationTokenService.execute({ token: mockToken })).rejects.toEqual({
            message: 'API_ERRORS.TOKEN_EXPIRED'
        });
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(ValidationToken);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ token: mockToken });
    });

    it('should throw an error if the token is already validated', async () => {
        const mockToken = 'alreadyValidatedToken';
        const mockValidationToken = {
            token: mockToken,
            validateTokenTime: new Date(Date.now() + 10000),
            validated: true,
        };
        const mockRepository = {
            findOneBy: jest.fn().mockResolvedValue(mockValidationToken),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
        await expect(validationTokenService.execute({ token: mockToken })).rejects.toEqual({
            message: 'API_ERRORS.TOKEN_EXPIRED'
        });
        expect(AppDataSource.getRepository).toHaveBeenCalledWith(ValidationToken);
        expect(mockRepository.findOneBy).toHaveBeenCalledWith({ token: mockToken });
    });
});
