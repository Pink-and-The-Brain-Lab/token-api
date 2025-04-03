import { NextFunction, Request, Response, Router } from "express";
import CreateValidationTokenService from "../services/CreateValidationTokenService";
import { AppError, ValidateEmail } from "millez-lib-api";

const generateNewTokenRouter = Router();

generateNewTokenRouter.post('/', async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { email } = request.body;
        const validateEmail = new ValidateEmail().validate(email);
        if (!validateEmail) throw new AppError('API_ERRORS.INVALID_EMAIL');
        const createValidationTokenService = new CreateValidationTokenService();
        await createValidationTokenService.execute(email);
        return response.json({ created: true });
    } catch (error) {
        next(error)
    }
});

export default generateNewTokenRouter;