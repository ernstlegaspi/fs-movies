"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropTables = exports.createMovieTable = exports.createUserTable = exports.pool = void 0;
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
const createMovieTable = async () => {
    try {
        await exports.pool.query(`
			CREATE TABLE IF NOT EXISTS movies (
				id SERIAL PRIMARY KEY,
				created_at TIMESTAMP DEFAULT NOW(),
				updated_at TIMESTAMP DEFAULT NOW(),
				description TEXT NOT NULL,
				title TEXT NOT NULL UNIQUE,
				genres TEXT[] NOT NULL,
				release_date DATE NOT NULL,
				duration INTEGER NOT NULL,
				slug TEXT NOT NULL
			)
		`);
    }
    catch (e) {
        throw new Error("Error creating movie table.");
    }
};
exports.createMovieTable = createMovieTable;
const dropTables = async () => {
    try {
        await Promise.all([
            exports.pool.query(`DROP TABLE IF EXISTS users`),
            exports.pool.query(`DROP TABLE IF EXISTS movies`)
        ]);
        console.log("Tables dropped");
    }
    catch (e) {
        throw new Error("Cannot drop table");
    }
};
exports.dropTables = dropTables;
