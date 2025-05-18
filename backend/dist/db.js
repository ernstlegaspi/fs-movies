"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropTable = exports.createUserTable = exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = __importDefault(require("pg"));
dotenv_1.default.config();
const { Pool } = pg_1.default;
exports.pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
const createUserTable = async () => {
    try {
        await exports.pool.query(`
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				email TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL
			)
		`);
        console.log("user table created");
    }
    catch (e) {
        throw new Error("Erorr creating user table.");
    }
};
exports.createUserTable = createUserTable;
const dropTable = async () => {
    try {
        await exports.pool.query(`DROP TABLE IF EXISTS users`);
    }
    catch (e) {
        throw new Error("Cannot drop table");
    }
};
exports.dropTable = dropTable;
