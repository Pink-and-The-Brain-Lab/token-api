import { AppDataSource } from "../../src/data-source";
import ValidationTokenService from "../../src/services/ValidationTokenService";

const fiveMinuteInMilliseconds = 5 * 60 * 1000;
const currentDateInMilliseconds = new Date().getTime();

const mockValidationToken = {
    id: '123456',
    token: '123456',
    email: 'email@mail.com',
    validateTokenTime: new Date(currentDateInMilliseconds + fiveMinuteInMilliseconds),
    createdAt: new Date(currentDateInMilliseconds),
    validated: false,
}

const mockAppDataSource: any = {
    save: () => jest.fn(),
    findOneBy: () => mockValidationToken,
};

describe('ValidationTokenService', () => {
    let service: ValidationTokenService;

    beforeEach(() => {
        service = new ValidationTokenService();
    });

    it('should validate a token', async () => {
        const spy = jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockAppDataSource);
        const token = await service.execute({ token: '123456' });
        expect(spy).toHaveBeenCalled();
        expect(token.validated).toBeTruthy();
    });

    it('should not found a token and throw an exception', async () => {
        try {
            mockAppDataSource.findOneBy = () => null;
            jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockAppDataSource);
            await service.execute({ token: '123456' });
        } catch (error: any) {
            expect(error.message).toEqual('TOKEN_NOT_FOUND');
            expect(error.statusCode).toBe(404);
        }
    });

    it('should return invalid token and thrown an exception', async () => {
        try {
            mockValidationToken.validated = true;
            mockAppDataSource.findOneBy = () => mockValidationToken;
            jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockAppDataSource);
            await service.execute({ token: '123456' });
        } catch (error: any) {
            expect(error.message).toEqual('API_ERRORS.TOKEN_EXPIRED');
            expect(error.statusCode).toBe(400);
        }
    });
});
