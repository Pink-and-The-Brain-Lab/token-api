import "reflect-metadata";
import { DataSource } from "typeorm";
import ValidationToken from "./models/validation-token.model";
import { CreateValidationToken1690497979962 } from "./database/migrations/1690497979962-CreateValidationToken";
import 'dotenv/config';
import { config } from "dotenv";

if (process.env.NODE_ENV === 'test') {
    config({ path: './.env.test' });
} else {
    config();
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT as string, 10),
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
