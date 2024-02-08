import "reflect-metadata";
import { DataSource } from "typeorm";
import ValidationToken from "./models/validation-token.model";
import { CreateValidationToken1690497979962 } from "./database/migrations/1690497979962-CreateValidationToken";
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "postgres",
    synchronize: false,
    logging: false,
    entities: [
        ValidationToken,
    ],
    migrations: [
        CreateValidationToken1690497979962,
    ],
    subscribers: [],
})
