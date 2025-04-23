import { Router } from "express";
import validationTokenRouter from "./validation-token";
import generateNewTokenRouter from "./generate-new-token";
const routes = Router();
routes.use('/token-validation', validationTokenRouter);
routes.use('/generate-new-token', generateNewTokenRouter);
export default routes;
