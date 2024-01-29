import { AppDataSource } from "../../src/data-source";
import CreateValidationTokenService from "../../src/services/CreateValidationTokenService";

const email = 'email@mail.com';

const mockToken = {
    token: '123456',
    email,
    validateTokenTime: new Date(),
    createdAt: new Date(),
    validated: false,
}

const mockAppDataSource: any = {
    create: () => mockToken,
    save: () => jest.fn(),
};

describe('CreateValidationTokenService', () => {
    let service: CreateValidationTokenService;

    beforeEach(() => {
        service = new CreateValidationTokenService();
    });

    it('should create new token', async () => {
        const spy = jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockAppDataSource);
        const token = await service.execute(email);
        expect(spy).toHaveBeenCalled();
        expect(token.email).toEqual(email);
    });

    it('should get an error with invalid email', async () => {
        try {
            jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockAppDataSource);
            await service.execute('email');
        } catch (error: any) {
            expect(error.message).toEqual('INVALID_EMAIL');
            expect(error.statusCode).toBe(400);
        }
    });
});
