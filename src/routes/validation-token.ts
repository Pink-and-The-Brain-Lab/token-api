import { NextFunction, Request, Response, Router } from "express";
import { IValidationToken } from "./interfaces/validation-token.interface";
import ValidationTokenService from "../services/ValidationTokenService";

const validationTokenRouter = Router();

validationTokenRouter.post('/', async (request: Request<IValidationToken>, response: Response, next: NextFunction) => {
    try {
        const { token } = request.body;
        const validationTokenService = new ValidationTokenService();
        await validationTokenService.execute({ token });
        return response.json({ validated: true });
    } catch (error) {
        next(error)
    }
});

export default validationTokenRouter;