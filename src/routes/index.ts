import { Router } from "express";
import validationTokenRouter from "./validation-token.routes";
import generateNewTokenRouter from "./generate-new-token.routes";
import RabbitMqListener from "../services/RabbitMqListener";
const routes = Router();
routes.use('/token-validation', validationTokenRouter);
routes.use('/generate-new-token', generateNewTokenRouter);
new RabbitMqListener().listeners();
export default routes;
