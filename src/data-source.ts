import "reflect-metadata";
import { DataSource } from "typeorm";
import ValidationToken from "./models/validation-token.model";
import { CreateValidationToken1690497979962 } from "./database/migrations/1690497979962-CreateValidationToken";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "postgres",
    password: "postgres",
    database: "millez-tokens",
    synchronize: true,
    logging: false,
    entities: [
        ValidationToken,
    ],
    migrations: [
        CreateValidationToken1690497979962,
    ],
    subscribers: [],
})
